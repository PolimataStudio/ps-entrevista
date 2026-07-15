// ===================== Estado Global =====================
const state = {
  segmentos: [],
  segmentoSelecionado: null,
  respostas: {},
  indicePergunta: 0,
  perguntasAtuais: [],
  dadosIdentificacao: null,
  ippCalculado: null,
  idRegistro: null
};

// ===================== DOM References =====================
const telas = {
  boasVindas: document.getElementById('boasVindas'),
  segmento: document.getElementById('segmento'),
  entrevista: document.getElementById('entrevista'),
  encerramento: document.getElementById('encerramento'),
  identificacao: document.getElementById('identificacao'),
  agradecimento: document.getElementById('agradecimento')
};

const btnIniciar = document.getElementById('btn-iniciar');
const btnVoltarSegmento = document.getElementById('btn-voltar-segmento');
const listaSegmentos = document.getElementById('lista-segmentos');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const btnIdentificacao = document.getElementById('btn-identificacao');
const formIdentificacao = document.getElementById('form-identificacao');
const btnReiniciar = document.getElementById('btn-reiniciar');

const conteudoPergunta = document.getElementById('conteudo-pergunta');
const tituloPergunta = document.getElementById('titulo-entrevista');
const progressoFill = document.querySelector('.progresso-fill');
const progressoTexto = document.getElementById('progresso-texto');

// ===================== INDEXEDDB HELPER =====================
const DB_NAME = 'EntrevistaPilotoDB';
const STORE_NAME = 'respostas';
let dbInstance = null;

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('segmento', 'segmento', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

async function salvarResposta(dados) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(dados);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===================== Funções de Navegação =====================
function mostrarTela(nome) {
  Object.keys(telas).forEach(key => {
    telas[key].classList.toggle('ativa', key === nome);
  });
}

// ===================== Carregar JSON =====================
async function carregarDados() {
  try {
    const resp = await fetch('perguntas.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dados = await resp.json();
    state.segmentos = dados.segmentos || [];
    console.log('✅ JSON carregado. Segmentos:', state.segmentos.length);
    return dados;
  } catch (error) {
    console.error('❌ Erro ao carregar JSON:', error);
    const aviso = document.querySelector('.info-box .aviso');
    if (aviso) aviso.textContent = '⚠️ Não foi possível carregar o questionário. Verifique o arquivo "perguntas.json".';
    return null;
  }
}

// ===================== Renderizar Segmentos =====================
function renderizarSegmentos() {
  listaSegmentos.innerHTML = '';
  if (!state.segmentos || state.segmentos.length === 0) {
    listaSegmentos.innerHTML = '<p style="text-align:center;color:var(--cor-texto-claro);">Nenhum segmento disponível.</p>';
    return;
  }
  state.segmentos.forEach(seg => {
    const card = document.createElement('div');
    card.className = 'card-segmento';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.id = seg.id;
    card.textContent = seg.titulo;
    card.addEventListener('click', () => selecionarSegmento(seg.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selecionarSegmento(seg.id);
      }
    });
    listaSegmentos.appendChild(card);
  });
}

function selecionarSegmento(id) {
  state.segmentoSelecionado = id;
  document.querySelectorAll('.card-segmento').forEach(el => {
    el.classList.toggle('selecionado', el.dataset.id === id);
  });
  iniciarEntrevista(id);
}

// ===================== Iniciar Entrevista =====================
function iniciarEntrevista(idSegmento) {
  const seg = state.segmentos.find(s => s.id === idSegmento);
  if (!seg) {
    alert('Segmento não encontrado.');
    return;
  }
  state.perguntasAtuais = seg.perguntas || [];
  state.indicePergunta = 0;
  state.respostas = {};
  mostrarTela('entrevista');
  renderizarPergunta();
}

// ===================== Renderizar Pergunta =====================
function renderizarPergunta() {
  const perguntas = state.perguntasAtuais;
  const idx = state.indicePergunta;
  if (!perguntas || idx >= perguntas.length) {
    mostrarTela('encerramento');
    return;
  }

  const pergunta = perguntas[idx];
  tituloPergunta.textContent = `Pergunta ${idx+1} de ${perguntas.length}`;

  const percentual = ((idx+1) / perguntas.length) * 100;
  progressoFill.style.width = Math.min(percentual, 100) + '%';
  progressoTexto.textContent = Math.round(Math.min(percentual, 100)) + '%';

  let html = `<p class="pergunta-texto"><strong>${pergunta.pergunta}</strong></p>`;
  html += `<div class="resposta-area">`;

  const tipo = pergunta.tipo;
  const valorSalvo = state.respostas[pergunta.id] || '';

  if (tipo === 'texto') {
    html += `<input type="text" id="resposta-input" value="${valorSalvo}" placeholder="Digite sua resposta..." />`;
  } else if (tipo === 'numero') {
    html += `<input type="number" id="resposta-input" value="${valorSalvo}" placeholder="Digite um número..." min="0" />`;
  } else if (tipo === 'sim_nao') {
    const simChecked = valorSalvo === 'sim' ? 'checked' : '';
    const naoChecked = valorSalvo === 'nao' ? 'checked' : '';
    html += `
      <div class="opcoes-simnao">
        <label><input type="radio" name="simnao" value="sim" ${simChecked} /> Sim</label>
        <label><input type="radio" name="simnao" value="nao" ${naoChecked} /> Não</label>
      </div>
    `;
  } else {
    html += `<input type="text" id="resposta-input" value="${valorSalvo}" />`;
  }

  html += `</div>`;
  conteudoPergunta.innerHTML = html;

  btnAnterior.style.display = idx === 0 ? 'none' : 'inline-block';
  btnProximo.textContent = idx === perguntas.length - 1 ? 'Finalizar' : 'Próximo';

  const input = document.getElementById('resposta-input');
  if (input) {
    input.addEventListener('input', () => {
      state.respostas[pergunta.id] = input.value;
    });
    if (tipo === 'numero') {
      input.addEventListener('change', () => {
        const val = parseFloat(input.value);
        state.respostas[pergunta.id] = isNaN(val) ? '' : val;
      });
    }
    setTimeout(() => input.focus(), 100);
  }

  const radios = document.querySelectorAll('input[name="simnao"]');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.respostas[pergunta.id] = radio.value;
    });
  });
}

// ===================== ALGORITMO IPP™ =====================
function normalizeScoreByType(pergunta, resposta) {
  const tipo = pergunta.tipo;

  if (tipo === 'sim_nao') {
    return resposta === 'sim' ? 1 : 0;
  }

  if (tipo === 'numero') {
    const val = Number(resposta);
    if (isNaN(val) || val < 0) return 0;
    if (val <= 50) return 0.2;
    if (val <= 200) return 0.5;
    if (val <= 1000) return 0.8;
    return 1;
  }

  if (tipo === 'texto') {
    if (!resposta || resposta.trim().length === 0) return 0.3;
    const palavras = ['não tenho', 'perdendo', 'preciso', 'agendamento', 'site', 'solução', 'app', 'sistema'];
    const temPalavra = palavras.some(p => resposta.toLowerCase().includes(p));
    return temPalavra ? 1 : 0.5;
  }

  return 0.5;
}

function calculaIPP(perguntas, respostas) {
  let SBase = 0;
  let WTotal = 0;
  let eliminatorioSuave = false;

  for (const q of perguntas) {
    const resposta = respostas[q.id];
    if (resposta === undefined || resposta === '') continue;

    const w = q.peso || 0;
    WTotal += w;
    const s = normalizeScoreByType(q, resposta);
    SBase += w * s;

    if (q.critico === 'eliminatorio_suave' && resposta === 'sim') {
      eliminatorioSuave = true;
    }
  }

  if (WTotal === 0) return 0;

  let SNorm = (SBase / WTotal) * 100;

  if (eliminatorioSuave) {
    SNorm = SNorm * 0.6;
  }

  for (const q of perguntas) {
    if (q.bonificador && q.bonificador > 0 && respostas[q.id] === 'sim') {
      SNorm += q.bonificador;
    }
  }

  return Math.min(100, Math.max(0, SNorm));
}

// ===================== Navegação na Entrevista =====================
btnProximo.addEventListener('click', () => {
  const perguntas = state.perguntasAtuais;
  const idx = state.indicePergunta;
  if (!perguntas || idx >= perguntas.length) return;

  const pergunta = perguntas[idx];
  const valor = state.respostas[pergunta.id];

  if (pergunta.obrigatoria) {
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      alert('Por favor, responda a pergunta antes de continuar.');
      return;
    }
    if (pergunta.tipo === 'numero' && isNaN(parseFloat(valor))) {
      alert('Por favor, insira um número válido.');
      return;
    }
  }

  if (idx === perguntas.length - 1) {
    state.ippCalculado = calculaIPP(perguntas, state.respostas);
    console.log(`🏷️ IPP™ calculado: ${state.ippCalculado}`);
    mostrarTela('encerramento');
  } else {
    state.indicePergunta = idx + 1;
    renderizarPergunta();
  }
});

btnAnterior.addEventListener('click', () => {
  if (state.indicePergunta > 0) {
    state.indicePergunta--;
    renderizarPergunta();
  }
});

// ===================== Eventos das Telas =====================
btnIniciar.addEventListener('click', () => {
  if (!state.segmentos || state.segmentos.length === 0) {
    alert('Aguarde o carregamento do questionário ou recarregue a página.');
    return;
  }
  mostrarTela('segmento');
  renderizarSegmentos();
});

btnVoltarSegmento.addEventListener('click', () => {
  mostrarTela('boasVindas');
});

btnIdentificacao.addEventListener('click', () => {
  mostrarTela('identificacao');
});

btnReiniciar.addEventListener('click', () => {
  state.segmentoSelecionado = null;
  state.respostas = {};
  state.indicePergunta = 0;
  state.perguntasAtuais = [];
  state.dadosIdentificacao = null;
  state.ippCalculado = null;
  state.idRegistro = null;
  mostrarTela('boasVindas');
});

// ===================== IDENTIFICAÇÃO, VALIDAÇÃO E ENVIO =====================
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(tel) {
  const numeros = tel.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

function marcarErro(campoId) {
  const campo = document.getElementById(campoId).closest('.campo');
  if (campo) campo.classList.add('erro');
}

function limparErros() {
  document.querySelectorAll('.campo.erro').forEach(el => el.classList.remove('erro'));
}

formIdentificacao.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparErros();

  const nome = document.getElementById('id-nome').value.trim();
  const telefone = document.getElementById('id-telefone').value.trim();
  const email = document.getElementById('id-email').value.trim();
  const cidade = document.getElementById('id-cidade').value.trim();
  const estado = document.getElementById('id-estado').value.trim();
  const organizacao = document.getElementById('id-organizacao').value.trim();
  const cargo = document.getElementById('id-cargo').value.trim();
  const realidade = document.getElementById('id-realidade').value.trim();

  let valido = true;

  if (!nome) { marcarErro('id-nome'); valido = false; }
  if (!telefone || !validarTelefone(telefone)) { marcarErro('id-telefone'); valido = false; }
  if (!email || !validarEmail(email)) { marcarErro('id-email'); valido = false; }
  if (!cidade) { marcarErro('id-cidade'); valido = false; }
  if (!estado || estado.length < 2) { marcarErro('id-estado'); valido = false; }
  if (!organizacao) { marcarErro('id-organizacao'); valido = false; }
  if (!cargo) { marcarErro('id-cargo'); valido = false; }

  if (!valido) {
    const primeiroErro = document.querySelector('.campo.erro');
    if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  state.dadosIdentificacao = { nome, telefone, email, cidade, estado, organizacao, cargo, realidade };

  // Prepara dados completos para envio
  const registro = {
    timestamp: new Date().toISOString(),
    segmento: state.segmentoSelecionado,
    respostas: state.respostas,
    identificacao: state.dadosIdentificacao,
    ipp: state.ippCalculado
  };

  // Desabilita botão
  const btnSubmit = formIdentificacao.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit.textContent;
  btnSubmit.textContent = 'Enviando...';
  btnSubmit.classList.add('carregando');
  btnSubmit.disabled = true;

  try {
    // 1. Salvar no IndexedDB (fallback)
    const id = await salvarResposta(registro);
    state.idRegistro = id;
    console.log(`💾 Dados salvos localmente (ID: ${id})`);

    // 2. Enviar para StaticForms
    const staticFormsData = {
      apiKey: 'sf_81a2b0ca7d6a2c1f6709f558',
      email: email,
      message: JSON.stringify(registro, null, 2)
    };

    const response = await fetch('https://api.staticforms.dev/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(staticFormsData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`StaticForms respondeu com status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📧 StaticForms resposta:', result);

    // Sucesso: vai para agradecimento
    mostrarTela('agradecimento');

  } catch (error) {
    console.error('❌ Erro no envio:', error);
    alert('Ocorreu um erro ao enviar seus dados. Mas não se preocupe, suas respostas foram salvas localmente. Tente novamente mais tarde ou entre em contato conosco.');
    // Mesmo com erro, vamos para agradecimento para não frustrar o usuário
    mostrarTela('agradecimento');
  } finally {
    // Restaura botão (pode não ser visível se já mudou de tela)
    btnSubmit.textContent = textoOriginal;
    btnSubmit.classList.remove('carregando');
    btnSubmit.disabled = false;
  }
});

// ===================== INICIALIZAÇÃO =====================
(async function init() {
  await carregarDados();
  mostrarTela('boasVindas');
})();

// ===================== SERVICE WORKER REGISTRATION =====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Novo Service Worker disponível. Atualize a página.');
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  });
}