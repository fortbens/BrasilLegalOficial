/**
 * Serviço de Consulta e Preenchimento Automático de CEP
 * Consulta ViaCEP com fallback para BrasilAPI e proxy interno do servidor.
 */

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge?: string;
  ddd?: string;
}

export function formatarCep(valor: string): string {
  const apenasDigitos = valor.replace(/\D/g, '').slice(0, 8);
  if (apenasDigitos.length <= 5) {
    return apenasDigitos;
  }
  return `${apenasDigitos.slice(0, 5)}-${apenasDigitos.slice(5)}`;
}

export function limparCep(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8);
}

export async function buscarEnderecoPorCep(cepInput: string): Promise<EnderecoViaCep | null> {
  const cepLimpo = limparCep(cepInput);
  if (cepLimpo.length !== 8) {
    return null;
  }

  // 1. Tentar endpoint interno (/api/cep/:cep) para evitar CORS e restrições de rede
  try {
    const resServer = await fetch(`/api/cep/${cepLimpo}`);
    if (resServer.ok) {
      const data = await resServer.json();
      if (data && !data.erro && data.logradouro !== undefined) {
        return {
          cep: formatarCep(data.cep || cepLimpo),
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || data.localidade || '',
          uf: (data.uf || '').toUpperCase(),
          ibge: data.ibge,
          ddd: data.ddd
        };
      }
    }
  } catch {
    // Continuar para fontes públicas se o servidor local falhar
  }

  // 2. Tentar ViaCEP diretamente do navegador
  try {
    const resViaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (resViaCep.ok) {
      const data = await resViaCep.json();
      if (!data.erro) {
        return {
          cep: formatarCep(data.cep || cepLimpo),
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: (data.uf || '').toUpperCase(),
          ibge: data.ibge,
          ddd: data.ddd
        };
      }
    }
  } catch {
    // Continuar para BrasilAPI
  }

  // 3. Fallback: BrasilAPI
  try {
    const resBrasilApi = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
    if (resBrasilApi.ok) {
      const data = await resBrasilApi.json();
      if (data && data.city) {
        return {
          cep: formatarCep(data.cep || cepLimpo),
          logradouro: data.street || '',
          complemento: '',
          bairro: data.neighborhood || '',
          cidade: data.city || '',
          uf: (data.state || '').toUpperCase()
        };
      }
    }
  } catch {
    // Falha em todas as fontes
  }

  return null;
}
