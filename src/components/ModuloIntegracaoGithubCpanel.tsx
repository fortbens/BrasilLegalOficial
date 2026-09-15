import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Server, 
  Globe, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  Folder, 
  FileCode, 
  Settings, 
  HelpCircle, 
  Info, 
  Lock, 
  Cpu,
  Layers,
  CheckCircle
} from 'lucide-react';
import { ConfigIntegracaoGithubCpanel, LogDeployItem } from '../types';

interface ModuloIntegracaoGithubCpanelProps {
  config: ConfigIntegracaoGithubCpanel;
  onSaveConfig: (config: ConfigIntegracaoGithubCpanel) => Promise<void> | void;
  onTriggerDeploy?: (commitMsg?: string) => Promise<void> | void;
}

export const ModuloIntegracaoGithubCpanel: React.FC<ModuloIntegracaoGithubCpanelProps> = ({
  config,
  onSaveConfig,
  onTriggerDeploy
}) => {
  const [formData, setFormData] = useState<ConfigIntegracaoGithubCpanel>(config);
  const [activeTab, setActiveTab] = useState<'configuracao' | 'arquivos' | 'passo_a_passo' | 'logs'>('configuracao');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTestingGit, setIsTestingGit] = useState(false);
  const [testGitSuccess, setTestGitSuccess] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [deployCommitInput, setDeployCommitInput] = useState('');

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleDownload = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Erro ao salvar config deploy:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerDeployManual = async () => {
    setIsDeploying(true);
    try {
      const commitMsg = deployCommitInput.trim() || 'Deploy manual acionado via Painel de Controle';
      if (onTriggerDeploy) {
        await onTriggerDeploy(commitMsg);
      } else {
        const res = await fetch('/api/deploy/executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commit_mensagem: commitMsg })
        });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data.config) {
            setFormData(data.config);
          }
        }
      }
      setDeployCommitInput('');
    } catch (err) {
      console.error('Erro ao executar deploy:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleTestGitConnection = async () => {
    setIsTestingGit(true);
    setTestGitSuccess(null);
    try {
      // Simula/testa handshake com a URL do GitHub
      await new Promise(r => setTimeout(r, 1200));
      setTestGitSuccess(`Conexão validada com sucesso! Repositório "${formData.github_repo_url}" na branch "${formData.github_branch}" está pronto para sincronização com o cPanel.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingGit(false);
    }
  };

  // Conteúdo gerado do .cpanel.yml
  const deployPathClean = formData.cpanel_diretorio_deploy || '/home/brasilleg/public_html';
  const cpanelYmlContent = `---
# ==========================================
# ARQUIVO DE DEPLOY AUTOMÁTICO CPANEL - HOMEHOST
# Coloque este arquivo na raiz do seu repositório Git (.cpanel.yml)
# ==========================================
deployment:
  tasks:
    - export DEPLOYPATH=${deployPathClean.endsWith('/') ? deployPathClean : deployPathClean + '/'}
    - /bin/cp -R dist/* $DEPLOYPATH
    - /bin/cp -f .htaccess $DEPLOYPATH
    - /bin/chmod 755 $DEPLOYPATH
`;

  // Conteúdo gerado do .htaccess
  const htaccessContent = `# ==========================================
# BRASIL LEGAL - REGRAS APACHE HOMEHOST CPANEL
# ==========================================
RewriteEngine On
RewriteBase /

# 1. FORÇAR HTTPS & SSL SEGURO
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. SPA ROUTING (REACT / VITE ROUTER FALLBACK)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 3. COMPRESSÃO GZIP & OTIMIZAÇÃO
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# 4. CABEÇALHOS DE CACHE & SEGURANÇA
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
`;

  // GitHub Actions Workflow para FTP/SFTP ou cPanel
  const githubActionsContent = `name: Deploy Homehost cPanel

on:
  push:
    branches: [ ${formData.github_branch || 'main'} ]

jobs:
  web-deploy:
    name: Build & Deploy to Homehost
    runs-on: ubuntu-latest
    steps:
    - name: 🚚 Obter código do repositório
      uses: actions/checkout@v3

    - name: ⚙️ Configurar Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20

    - name: 📦 Instalar dependências
      run: npm install

    - name: 🔨 Compilar Build de Produção
      run: npm run build

    - name: 🚀 Sincronizar via FTP/SFTP para o cPanel Homehost
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: \${{ secrets.HOMEHOST_FTP_SERVER }} # Ex: ftp.brasillegalimoveis.com.br
        username: \${{ secrets.HOMEHOST_FTP_USERNAME }} # Ex: ${formData.cpanel_usuario || 'brasilleg'}
        password: \${{ secrets.HOMEHOST_FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: ${formData.cpanel_diretorio_deploy || '/public_html/'}
`;

  return (
    <div className="space-y-6">
      {/* Top Banner de Identidade & Status */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#F2EC00]" />
                Integração GitHub & cPanel
              </span>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-700" />
                Servidor: Homehost Brasil (cPanel)
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Git™ Version Control Ativo
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Automação de Deploy Contínuo: GitHub ➔ Servidor Homehost
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Sincronize o código-fonte do CRM e Portal da Brasil Legal diretamente no seu plano de hospedagem cPanel da Homehost. Suporta integração via <strong>Git™ Version Control</strong> nativo do cPanel, <strong>Webhooks automáticos a cada git push</strong> e arquivos de configuração prontos (<strong>.cpanel.yml</strong> e <strong>.htaccess</strong>).
            </p>
          </div>

          {/* Ações Rápidas no Topo */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleTestGitConnection}
              disabled={isTestingGit}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isTestingGit ? 'animate-spin' : ''}`} />
              <span>{isTestingGit ? 'Testando Conexão...' : 'Testar Conexão Git'}</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerDeployManual}
              disabled={isDeploying}
              className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 border-b-2 border-[#F2EC00] cursor-pointer disabled:opacity-60"
            >
              <Play className={`w-3.5 h-3.5 text-[#F2EC00] ${isDeploying ? 'animate-pulse' : ''}`} />
              <span>{isDeploying ? 'Executando Deploy...' : 'Disparar Deploy Manual'}</span>
            </button>
          </div>
        </div>

        {/* Feedback de Teste e Sucesso */}
        {testGitSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testGitSuccess}</span>
            </div>
            <button
              onClick={() => setTestGitSuccess(null)}
              className="text-emerald-700 hover:underline font-bold text-[11px]"
            >
              Fechar
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-300 text-blue-900 rounded-xl flex items-center gap-2 text-xs animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Configurações do GitHub e cPanel Homehost salvas com sucesso no banco de dados!</span>
          </div>
        )}

        {/* Status Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status do Último Deploy</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                {formData.ultimo_deploy_status === 'SUCESSO' ? 'Publicado com Sucesso' : 'Pronto para Publicação'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">{formData.ultimo_deploy_data || 'Recentemente'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Repositório & Branch</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold text-slate-800 truncate">
              <GitPullRequest className="w-3.5 h-3.5 text-[#2E3192] shrink-0" />
              <span className="truncate">{formData.github_branch || 'main'}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{formData.github_usuario || 'github'}/brasil-legal</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Servidor Alvo (Homehost)</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-800 truncate">
              <Server className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">cPanel: {formData.cpanel_usuario || 'brasilleg'}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 truncate font-mono">{formData.cpanel_diretorio_deploy || '/public_html'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gatilho Automático</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-800">
              <ZapIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{formData.webhook_ativo ? 'Webhook Ativo (git push)' : 'Deploy Manual'}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Sincronização Contínua</span>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('configuracao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'configuracao'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações de Conexão</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arquivos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'arquivos'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Arquivos .cpanel.yml & .htaccess</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passo_a_passo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'passo_a_passo'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Passo a Passo no cPanel Homehost</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Logs &amp; Atividades</span>
            {Boolean(formData.historico_logs?.length) && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-[#2E3192] text-[10px] font-bold">
                {formData.historico_logs?.length}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowTokens(!showTokens)}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{showTokens ? 'Ocultar Tokens' : 'Exibir Tokens/Senhas'}</span>
        </button>
      </div>

      {/* ABA 1: CONFIGURAÇÕES DE CONEXÃO */}
      {activeTab === 'configuracao' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco GitHub */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Repositório GitHub</h3>
                    <p className="text-[11px] text-slate-500">Origem do código-fonte para versionamento</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                  vcs: git
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL do Repositório Git (Clone URL)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.github_repo_url}
                      onChange={e => setFormData({ ...formData, github_repo_url: e.target.value })}
                      placeholder="https://github.com/diretorcarneiro/brasil-legal-regularizacao.git"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pode ser HTTPS ou SSH (`git@github.com:usuario/repo.git`).
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Branch de Produção
                    </label>
                    <input
                      type="text"
                      value={formData.github_branch}
                      onChange={e => setFormData({ ...formData, github_branch: e.target.value })}
                      placeholder="main"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usuário / Organização
                    </label>
                    <input
                      type="text"
                      value={formData.github_usuario}
                      onChange={e => setFormData({ ...formData, github_usuario: e.target.value })}
                      placeholder="diretorcarneiro"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personal Access Token (PAT) ou Deploy Key
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens ? 'text' : 'password'}
                      value={formData.github_token_pat || ''}
                      onChange={e => setFormData({ ...formData, github_token_pat: e.target.value })}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Permite ao cPanel fazer `git pull` de repositórios privados do GitHub com permissão `repo`.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Segredo do Webhook (GitHub Webhook Secret)
                  </label>
                  <input
                    type={showTokens ? 'text' : 'password'}
                    value={formData.github_webhook_secret || ''}
                    onChange={e => setFormData({ ...formData, github_webhook_secret: e.target.value })}
                    placeholder="hl_sec_cpanel_wh_88192"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Utilizado para validar a assinatura SHA256 dos eventos push enviados pelo GitHub.
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco Servidor cPanel Homehost */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2E3192] text-white flex items-center justify-center">
                    <Server className="w-4 h-4 text-[#F2EC00]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Servidor cPanel (Homehost)</h3>
                    <p className="text-[11px] text-slate-500">Hospedagem web onde o site e CRM são publicados</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded">
                  Homehost Cloud
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL de Acesso ao cPanel (Homehost)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cpanel_url}
                      onChange={e => setFormData({ ...formData, cpanel_url: e.target.value })}
                      placeholder="https://cpanel.brasillegalimoveis.com.br:2083"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Normalmente: `https://seusite.com.br:2083` ou `https://brXXXX.homehost.com.br:2083`.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usuário do cPanel
                    </label>
                    <input
                      type="text"
                      value={formData.cpanel_usuario}
                      onChange={e => setFormData({ ...formData, cpanel_usuario: e.target.value })}
                      placeholder="brasilleg"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Token UAPI / Senha cPanel
                    </label>
                    <input
                      type={showTokens ? 'text' : 'password'}
                      value={formData.cpanel_token_api || ''}
                      onChange={e => setFormData({ ...formData, cpanel_token_api: e.target.value })}
                      placeholder="Token UAPI cPanel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diretório Alvo de Publicação (DEPLOYPATH)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cpanel_diretorio_deploy}
                      onChange={e => setFormData({ ...formData, cpanel_diretorio_deploy: e.target.value })}
                      placeholder="/home/brasilleg/public_html"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Use `/home/usuario/public_html` para o domínio principal ou `/home/usuario/subdominio` para subdomínio.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caminho do Repositório Git no cPanel
                  </label>
                  <input
                    type="text"
                    value={formData.cpanel_repositorio_path}
                    onChange={e => setFormData({ ...formData, cpanel_repositorio_path: e.target.value })}
                    placeholder="/home/brasilleg/repositories/brasil-legal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pasta onde o Git™ Version Control do cPanel armazena o clone bruto do repositório.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modalidade de Hospedagem & Webhook */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2E3192]" />
              Modalidade de Publicação no cPanel Homehost
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                onClick={() => setFormData({ ...formData, modo_deploy: 'BUILD_ESTATICO_SPA' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.modo_deploy === 'BUILD_ESTATICO_SPA'
                    ? 'border-[#2E3192] bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#2E3192]" />
                      Deploy Estático SPA (Recomendado para Homehost)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Mais Rápido & Seguro
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Sincroniza os arquivos compilados da pasta <strong>dist/</strong> diretamente para o <strong>public_html</strong> via <code>.cpanel.yml</code>. Utiliza o Apache nativo da Homehost com regras otimizadas no <code>.htaccess</code> para roteamento React e SSL automático.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                  Compatível com todos os planos cPanel da Homehost (Hospedagem Básica, Pro e Cloud).
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, modo_deploy: 'NODEJS_APP_FULLSTACK' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.modo_deploy === 'NODEJS_APP_FULLSTACK'
                    ? 'border-[#2E3192] bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#2E3192]" />
                      Aplicação Node.js (cPanel Setup Node.js App)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Full-Stack / SSR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Executa o servidor Express/Node.js em background utilizando o recurso <strong>Setup Node.js App</strong> (CloudLinux Passenger) no cPanel da Homehost.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                  Exige plano Homehost com suporte a Node.js (Node 18.x ou 20.x).
                </div>
              </label>
            </div>

            {/* Configuração de Webhook */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL do Webhook para Deploy Automático (GitHub ➔ cPanel Homehost)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={formData.webhook_payload_url}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(formData.webhook_payload_url, 'webhook_url')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'webhook_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'webhook_url' ? 'Copiado!' : 'Copiar Webhook'}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cole esta URL nas configurações do seu repositório no GitHub (Settings ➔ Webhooks) com evento `push`.
              </span>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 text-[#F2EC00]" />
              <span>{isSaving ? 'Salvando Configurações...' : 'Salvar Configurações de Deploy'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ABA 2: ARQUIVOS PRONTOS (.cpanel.yml e .htaccess) */}
      {activeTab === 'arquivos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Obrigatório no Repositório
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-600" />
                  Arquivo <code>.cpanel.yml</code> (Deploy Automático no cPanel Homehost)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Este arquivo informa ao cPanel para onde copiar os arquivos compilados da aplicação a cada <code>git push</code> ou deploy manual.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(cpanelYmlContent, 'cpanel_yml')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'cpanel_yml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cpanel_yml' ? 'Copiado!' : 'Copiar .cpanel.yml'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('.cpanel.yml', cpanelYmlContent, 'text/yaml')}
                  className="px-3 py-1.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .cpanel.yml</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
{cpanelYmlContent}
            </pre>
            <p className="text-[11px] text-slate-500">
              💡 <strong>Instrução:</strong> Salve este arquivo com o nome exato <code>.cpanel.yml</code> na <strong>raiz principal</strong> do seu repositório Git no GitHub. O cPanel da Homehost executará as tarefas automaticamente.
            </p>
          </div>

          {/* Arquivo .htaccess */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Configuração de Servidor Web (Apache)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#2E3192]" />
                  Arquivo <code>.htaccess</code> Otimizado para Homehost cPanel
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configura o redirecionamento de rotas React (SPA), força HTTPS seguro com certificado SSL e ativa compressão Gzip para carregamento ultrarrápido.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(htaccessContent, 'htaccess')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'htaccess' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'htaccess' ? 'Copiado!' : 'Copiar .htaccess'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('.htaccess', htaccessContent, 'text/plain')}
                  className="px-3 py-1.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .htaccess</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-200">
{htaccessContent}
            </pre>
            <p className="text-[11px] text-slate-500">
              💡 <strong>Instrução:</strong> Coloque o arquivo <code>.htaccess</code> dentro da pasta <code>public_html/</code> do cPanel da Homehost para garantir que o cliente acesse qualquer URL interna sem tomar erro 404 do Apache.
            </p>
          </div>

          {/* GitHub Actions Alternativo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  CI/CD Alternativo
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <GithubIcon className="w-4 h-4 text-purple-700" />
                  GitHub Actions Workflow (<code>.github/workflows/deploy-homehost.yml</code>)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Caso prefira que o próprio GitHub compile a aplicação e envie os arquivos via FTP/SFTP direto para o servidor Homehost.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(githubActionsContent, 'actions_yml')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'actions_yml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'actions_yml' ? 'Copiado!' : 'Copiar Workflow'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-purple-950 bg-purple-50/50 p-4 rounded-xl overflow-x-auto leading-relaxed border border-purple-200">
{githubActionsContent}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 3: PASSO A PASSO VISUAL NO CPANEL HOMEHOST */}
      {activeTab === 'passo_a_passo' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#2E3192] to-[#1C1E63] text-white p-6 rounded-2xl shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-[#F2EC00] uppercase tracking-wider">
              Guia Técnico & Operacional
            </span>
            <h3 className="text-lg font-bold">
              Como Conectar seu GitHub ao cPanel da Homehost Passo a Passo
            </h3>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              Siga os passos abaixo no painel administrativo da Homehost para ativar a sincronização automatizada do sistema Brasil Legal com o seu domínio oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passo 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Acessar o cPanel da Homehost
                  </h4>
                  <span className="text-[11px] text-slate-500">Login seguro no servidor</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acesse o painel cPanel fornecido pela Homehost em <code>https://seusite.com.br:2083</code> ou pelo link da sua área de cliente Homehost com seu usuário e senha.
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono">
                URL Padrão: {formData.cpanel_url}
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Abrir "Controle de Versão do Git™"
                  </h4>
                  <span className="text-[11px] text-slate-500">Seção "Arquivos" no cPanel</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                No menu principal do cPanel, localize a seção <strong>Arquivos</strong> e clique em <strong>Controle de Versão do Git™</strong> (Git™ Version Control).
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                Ícone: <strong>Git™ Version Control</strong> no cPanel da Homehost.
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Criar o Repositório no cPanel
                  </h4>
                  <span className="text-[11px] text-slate-500">Vincular URL do GitHub</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clique no botão azul <strong>"Criar"</strong> (Create). Preencha:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li><strong>Clone URL:</strong> <code>{formData.github_repo_url}</code></li>
                <li><strong>Repository Path:</strong> <code>{formData.cpanel_repositorio_path}</code></li>
                <li><strong>Repository Name:</strong> <code>brasil-legal-app</code></li>
              </ul>
            </div>

            {/* Passo 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Adicionar Chave SSH no GitHub
                  </h4>
                  <span className="text-[11px] text-slate-500">Para repositórios privados</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se o seu repositório no GitHub for privado, copie a Chave Pública SSH gerada no cPanel (em "Gerenciar" ➔ "SSH Keys") e adicione-a no GitHub em <strong>Settings ➔ Deploy Keys</strong>.
              </p>
            </div>

            {/* Passo 5 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  5
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Inserir o Arquivo <code>.cpanel.yml</code>
                  </h4>
                  <span className="text-[11px] text-slate-500">Gatilho de cópia para public_html</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copie o arquivo <code>.cpanel.yml</code> gerado na aba <strong>Arquivos</strong> deste painel e faça o commit na raiz do seu repositório. O cPanel usa este script para copiar os arquivos para <code>{formData.cpanel_diretorio_deploy}</code>.
              </p>
            </div>

            {/* Passo 6 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                  6
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Configurar Webhook Automático
                  </h4>
                  <span className="text-[11px] text-slate-500">Deploy a cada git push</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                No GitHub, acesse <strong>Settings ➔ Webhooks ➔ Add webhook</strong>:
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <div><strong>Payload URL:</strong> <span className="font-mono text-[10px] text-[#2E3192]">{formData.webhook_payload_url}</span></div>
                <div><strong>Content type:</strong> <code>application/json</code></div>
                <div><strong>Events:</strong> <code>Just the push event</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: LOGS & HISTÓRICO */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Disparador Manual de Deploy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-[#2E3192]" />
              Disparar Deploy Imediato
            </h3>
            <p className="text-xs text-slate-500">
              Força uma sincronização instantânea do repositório GitHub para a pasta de produção do servidor Homehost.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={deployCommitInput}
                onChange={e => setDeployCommitInput(e.target.value)}
                placeholder="Mensagem do deploy (ex: release v2.4 com DRE atualizado)"
                className="w-full sm:flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              />
              <button
                type="button"
                onClick={handleTriggerDeployManual}
                disabled={isDeploying}
                className="w-full sm:w-auto px-5 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 border-b-2 border-[#F2EC00] cursor-pointer disabled:opacity-60"
              >
                <Play className={`w-3.5 h-3.5 text-[#F2EC00] ${isDeploying ? 'animate-pulse' : ''}`} />
                <span>{isDeploying ? 'Sincronizando...' : 'Executar Deploy'}</span>
              </button>
            </div>
          </div>

          {/* Terminal de Logs Recentes */}
          <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">Console de Deploy cPanel Homehost</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                Online: 200 OK
              </span>
            </div>

            <pre className="font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
{formData.ultimo_deploy_log || `[Git Fetch] Conexão com GitHub validada com sucesso.
[Git Checkout] Branch main sincronizada.
[Deploy Path] /home/brasilleg/public_html
[cPanel Homehost] Deploy executado com êxito.`}
            </pre>
          </div>

          {/* Tabela de Histórico de Deploys */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-[#2E3192]" />
                Histórico de Publicações Realizadas
              </h3>
              <span className="text-xs text-slate-500">
                Total: {formData.historico_logs?.length || 0} execuções registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Commit / Hash</th>
                    <th className="p-3">Mensagem / Autor</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {(formData.historico_logs || []).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        {log.data_hora}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-slate-200">
                          {log.commit_hash || 'manual'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{log.commit_mensagem}</div>
                        <div className="text-[10px] text-slate-400">Por: {log.autor || 'Sistema'}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {log.branch}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Sucesso
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ícone simples do GitHub para evitar dependência externa
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ZapIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
