// ==========================================
// SIMULADOR DE ORÇAMENTO - SCRIPT PRINCIPAL
// ==========================================

// Configuração dos serviços disponíveis
const SERVICOS = {
  'Troca de Tomadas': { icon: '🔌', preco: 150 },
  'Colocação de Novo Ponto de Energia': { icon: '⚡', preco: 250 },
  'Troca e Colocação de Luminárias': { icon: '💡', preco: 180 },
  'Colocação de Spots': { icon: '✨', preco: 120 },
  'Fiação e Cabeamento': { icon: '🔧', preco: 300 },
  'Automação Residencial': { icon: '🏠', preco: 500 }
};

const WHATSAPP_NUMBER = '5511991030069';

// ==========================================
// Inicialização
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  inicializarSimulador();
  configurarEventosMenu();
  configurarCarrossel();
});

function inicializarSimulador() {
  // Adicionar primeiro serviço vazio
  adicionarServico();
  
  // Configurar eventos
  document.getElementById('addServiceBtn').addEventListener('click', adicionarServico);
  document.getElementById('simuladorForm').addEventListener('submit', enviarOrcamento);
  document.getElementById('incluirVisita').addEventListener('change', atualizarTotal);
  document.getElementById('visitaValue').addEventListener('input', atualizarTotal);
}

// ==========================================
// Gerenciar Serviços
// ==========================================
function adicionarServico() {
  const container = document.getElementById('servicesContainer');
  const index = container.children.length;
  
  const serviceItem = document.createElement('div');
  serviceItem.className = 'service-item';
  serviceItem.id = `service-${index}`;
  
  let opcoesServicos = '<option value="">Selecione um serviço...</option>';
  for (const [nome, dados] of Object.entries(SERVICOS)) {
    opcoesServicos += `<option value="${nome}" data-preco="${dados.preco}">${dados.icon} ${nome}</option>`;
  }
  
  serviceItem.innerHTML = `
    <div class="form-group">
      <label for="servico-${index}">Serviço <span class="required">*</span></label>
      <select id="servico-${index}" class="servico-select" required>
        ${opcoesServicos}
      </select>
    </div>
    
    <div class="form-group">
      <label for="quantidade-${index}">Qtd.</label>
      <input type="number" id="quantidade-${index}" class="quantidade-input" value="1" min="1" step="1" />
    </div>
    
    <button type="button" class="service-remove" onclick="removerServico(${index})">Remover</button>
  `;
  
  container.appendChild(serviceItem);
  
  // Adicionar eventos de mudança
  const select = serviceItem.querySelector('.servico-select');
  const input = serviceItem.querySelector('.quantidade-input');
  
  select.addEventListener('change', atualizarTotal);
  input.addEventListener('input', atualizarTotal);
}

function removerServico(index) {
  const service = document.getElementById(`service-${index}`);
  if (service) {
    service.remove();
    atualizarTotal();
  }
}

// ==========================================
// Cálculo e Atualização do Total
// ==========================================
function atualizarTotal() {
  let subtotalServicos = 0;
  const servicios = document.querySelectorAll('.service-item');
  
  servicios.forEach(item => {
    const select = item.querySelector('.servico-select');
    const input = item.querySelector('.quantidade-input');
    
    if (select.value) {
      const preco = parseFloat(select.options[select.selectedIndex].dataset.preco) || 0;
      const quantidade = parseInt(input.value) || 1;
      subtotalServicos += preco * quantidade;
    }
  });
  
  // Calcular visita técnica
  const incluirVisita = document.getElementById('incluirVisita').checked;
  const visitaValue = parseFloat(document.getElementById('visitaValue').value) || 0;
  const subtotalVisita = incluirVisita ? visitaValue : 0;
  
  // Calcular total
  const total = subtotalServicos + subtotalVisita;
  
  // Atualizar exibição
  document.getElementById('subtotalServiços').textContent = formatarMoeda(subtotalServicos);
  document.getElementById('subtotalVisita').textContent = formatarMoeda(subtotalVisita);
  document.getElementById('totalOrcamento').textContent = formatarMoeda(total);
  
  // Armazenar valores globais para envio
  window.orcamentoDados = {
    subtotalServicos,
    subtotalVisita,
    total
  };
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// ==========================================
// Enviar Orçamento via WhatsApp
// ==========================================
function enviarOrcamento(e) {
  e.preventDefault();
  
  // Validar campos obrigatórios
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  
  if (!nome || !email || !telefone) {
    alert('Por favor, preencha todos os dados obrigatórios (Nome, E-mail e Telefone).');
    return;
  }
  
  // Verificar se há pelo menos um serviço selecionado
  const servicios = document.querySelectorAll('.servico-select');
  const temServico = Array.from(servicios).some(s => s.value !== '');
  
  if (!temServico) {
    alert('Por favor, selecione pelo menos um serviço.');
    return;
  }
  
  // Montar mensagem para WhatsApp
  let mensagem = `*🏠 SOLICITAÇÃO DE ORÇAMENTO - PONTO DE IGNIÇÃO*\n\n`;
  mensagem += `*Solicite aqui seu orçamento sem compromisso.*\n\n`;
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  mensagem += `*📋 DADOS DO CLIENTE*\n`;
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  mensagem += `*Nome:* ${nome}\n`;
  mensagem += `*E-mail:* ${email}\n`;
  mensagem += `*Telefone:* ${telefone}\n\n`;
  
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  mensagem += `*🔌 SERVIÇOS SOLICITADOS*\n`;
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // Adicionar serviços
  document.querySelectorAll('.service-item').forEach((item, index) => {
    const select = item.querySelector('.servico-select');
    const input = item.querySelector('.quantidade-input');
    
    if (select.value) {
      const servico = select.value;
      const quantidade = parseInt(input.value) || 1;
      const preco = parseFloat(select.options[select.selectedIndex].dataset.preco) || 0;
      const subtotal = preco * quantidade;
      
      mensagem += `${index + 1}. ${servico}\n`;
      mensagem += `   Quantidade: ${quantidade}x\n`;
      mensagem += `   Valor unitário: ${formatarMoeda(preco)}\n`;
      mensagem += `   Subtotal: ${formatarMoeda(subtotal)}\n\n`;
    }
  });
  
  // Adicionar visita técnica se incluída
  if (document.getElementById('incluirVisita').checked) {
    const visitaValue = parseFloat(document.getElementById('visitaValue').value) || 0;
    mensagem += `🚗 *Visita Técnica:* ${formatarMoeda(visitaValue)}\n\n`;
  }
  
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  mensagem += `*💰 RESUMO DO ORÇAMENTO*\n`;
  mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  mensagem += `*Subtotal de Serviços:* ${document.getElementById('subtotalServiços').textContent}\n`;
  mensagem += `*Visita Técnica:* ${document.getElementById('subtotalVisita').textContent}\n`;
  mensagem += `*TOTAL ESTIMADO:* ${document.getElementById('totalOrcamento').textContent}\n\n`;
  mensagem += `⚠️ *Este é um orçamento estimado. Confirme os valores antes de prosseguir.*\n`;
  
  // Codificar e abrir WhatsApp
  const mensagemCodificada = encodeURIComponent(mensagem);
  const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemCodificada}`;
  
  window.open(urlWhatsApp, '_blank');
}

// ==========================================
// Configurar Menu (existente)
// ==========================================
function configurarEventosMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      menuToggle.innerText = sidebar.classList.contains('open') ? '✕' : '☰';
    });
  }
  
  // Scroll ativo do menu
  let ticking = false;
  const navLinks = document.querySelectorAll('nav a.nav-link');
  const sections = document.querySelectorAll('main > section');
  
  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 250) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveNav);
      ticking = true;
    }
  }, { passive: true });
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        sidebar.classList.remove('open');
        if(window.innerWidth <= 1024) menuToggle.innerText = '☰';
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ==========================================
// Configurar Carrossel (existente)
// ==========================================
function configurarCarrossel() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (slides.length === 0 || !prevBtn || !nextBtn) return;
  
  let currentSlide = 0;
  
  function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  
  prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
}