// Dados Mockados para fallback caso o data.json (gerado pelo DynamoDB) não exista localmente
const mockData = [
    { jogoId: "J001", titulo: "Flamengo x Fluminense", campeonato: "Campeonato Carioca", data: "2025-03-15", horario: "16:00", placar: "3 x 1", status: "Disponível", avaliacao: "4.8", duracao_min: 110, url_thumb: "https://via.placeholder.com/300x170/8B0000/FFFFFF?text=FLA+x+FLU" },
    { jogoId: "J002", titulo: "Palmeiras x Corinthians", campeonato: "Campeonato Paulista", data: "2025-03-22", horario: "18:30", placar: "2 x 2", status: "Disponível", avaliacao: "4.9", duracao_min: 113, url_thumb: "https://via.placeholder.com/300x170/006400/FFFFFF?text=PAL+x+COR" },
    { jogoId: "J003", titulo: "Grêmio x Internacional", campeonato: "Gauchão", data: "2025-04-05", horario: "16:00", placar: "1 x 0", status: "Disponível", avaliacao: "4.7", duracao_min: 108, url_thumb: "https://via.placeholder.com/300x170/000080/FFFFFF?text=GRE+x+INT" },
    { jogoId: "J004", titulo: "Atlético-MG x Cruzeiro", campeonato: "Campeonato Mineiro", data: "2025-04-12", horario: "18:30", placar: "0 x 1", status: "Disponível", avaliacao: "4.6", duracao_min: 106, url_thumb: "https://via.placeholder.com/300x170/000000/FFFFFF?text=CAM+x+CRU" },
    { jogoId: "J005", titulo: "São Paulo x Santos", campeonato: "Campeonato Paulista", data: "2025-04-19", horario: "16:00", placar: "2 x 0", status: "Disponível", avaliacao: "4.5", duracao_min: 104, url_thumb: "https://via.placeholder.com/300x170/FF0000/FFFFFF?text=SAO+x+SAN" },
    { jogoId: "J006", titulo: "Botafogo x Vasco", campeonato: "Campeonato Carioca", data: "2025-04-26", horario: "18:30", placar: "1 x 1", status: "Disponível", avaliacao: "4.4", duracao_min: 112, url_thumb: "https://via.placeholder.com/300x170/000000/FFFFFF?text=BOT+x+VAS" },
    { jogoId: "J007", titulo: "Bahia x Vitória", campeonato: "Campeonato Baiano", data: "2025-05-03", horario: "16:00", placar: "3 x 0", status: "Disponível", avaliacao: "4.3", duracao_min: 107, url_thumb: "https://via.placeholder.com/300x170/0000FF/FFFFFF?text=BAH+x+VIT" },
    { jogoId: "J008", titulo: "Sport x Náutico", campeonato: "Campeonato Pernambucano", data: "2025-05-10", horario: "16:00", placar: "2 x 1", status: "Disponível", avaliacao: "4.2", duracao_min: 105, url_thumb: "https://via.placeholder.com/300x170/FF0000/FFFFFF?text=SPO+x+NAU" },
    { jogoId: "J009", titulo: "Fortaleza x Ceará", campeonato: "Campeonato Cearense", data: "2025-05-17", horario: "18:30", placar: "1 x 2", status: "Disponível", avaliacao: "4.6", duracao_min: 109, url_thumb: "https://via.placeholder.com/300x170/00008B/FFFFFF?text=FOR+x+CEA" },
    { jogoId: "J010", titulo: "Athletico-PR x Coritiba", campeonato: "Campeonato Paranaense", data: "2025-05-24", horario: "16:00", placar: "0 x 0", status: "Disponível", avaliacao: "4.5", duracao_min: 120, url_thumb: "https://via.placeholder.com/300x170/8B0000/FFFFFF?text=CAP+x+CFC" },
    { jogoId: "J011", titulo: "Brasil x Argentina", campeonato: "Eliminatórias Copa 2026", data: "2025-06-05", horario: "21:45", placar: "—", status: "Em Breve", avaliacao: "—", duracao_min: "—", url_thumb: "https://via.placeholder.com/300x170/FFD700/008000?text=BRA+x+ARG" },
    { jogoId: "J012", titulo: "Flamengo x PSG", campeonato: "Mundial de Clubes FIFA", data: "2025-06-20", horario: "15:00", placar: "—", status: "Em Breve", avaliacao: "—", duracao_min: "—", url_thumb: "https://via.placeholder.com/300x170/8B0000/FFFFFF?text=FLA+x+PSG" }
];

let allGames = [];

async function loadGames() {
    try {
        // Tenta carregar o data.json gerado pelo AWS CLI (User Data no EC2)
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('data.json não encontrado');
        const data = await response.json();
        
        // Tratar o formato do DynamoDB CLI JSON se existir
        if (data.Items) {
            allGames = data.Items.map(item => {
                const parsed = {};
                for (const key in item) {
                    const type = Object.keys(item[key])[0]; // "S", "N", etc.
                    parsed[key] = item[key][type];
                }
                return parsed;
            });
        } else {
            allGames = data; // Se for um JSON normal gerado por outra ferramenta
        }
    } catch (e) {
        console.log('Utilizando dados de fallback (mock) pois o data.json não foi encontrado. Isso é normal no ambiente local.', e);
        allGames = mockData;
    }

    populateFilters();
    renderGames(allGames);
}

function renderGames(games) {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = '';

    if (games.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; font-size: 1.2rem; margin-top: 20px;">Nenhum jogo encontrado para os filtros selecionados.</p>';
        return;
    }

    games.forEach(game => {
        let statusClass = 'status-disponivel';
        const st = game.status ? game.status.toLowerCase() : '';
        if (st.includes('vivo')) statusClass = 'status-aovivo';
        if (st.includes('breve')) statusClass = 'status-embreve';

        // Thumb url mock based on the placeholder idea if missing
        const thumbUrl = game.url_thumb || `https://via.placeholder.com/300x170/333333/FFFFFF?text=${encodeURIComponent(game.titulo)}`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${thumbUrl}" alt="${game.titulo}" class="card-img">
            <div class="card-content">
                <div class="card-title">${game.titulo}</div>
                <div class="card-info" style="color: #E50914; font-weight: 600;">${game.campeonato}</div>
                <div class="card-info">${game.data} | ${game.horario}</div>
                ${game.placar && game.placar !== '—' ? `<div class="card-info" style="color:#fff; font-weight:bold; font-size: 1.1rem; margin-top: 5px;">Placar: ${game.placar}</div>` : ''}
                <div class="card-status ${statusClass}">${game.status}</div>
                
                <a href="#" class="btn-assistir" onclick="alert('Assistindo: ${game.titulo}\\nVocê seria redirecionado para o player de vídeo.'); return false;">Assistir Agora</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

function populateFilters() {
    const campeonatos = [...new Set(allGames.map(g => g.campeonato))];
    const selectCamp = document.getElementById('filter-campeonato');
    
    // Evita duplicar se a função for chamada novamente
    selectCamp.innerHTML = '<option value="all">Todos os Campeonatos</option>';

    campeonatos.forEach(c => {
        if (!c) return;
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        selectCamp.appendChild(opt);
    });

    document.getElementById('filter-campeonato').addEventListener('change', filterGames);
    document.getElementById('filter-status').addEventListener('change', filterGames);
}

function filterGames() {
    const camp = document.getElementById('filter-campeonato').value;
    const stat = document.getElementById('filter-status').value;

    let filtered = allGames;

    if (camp !== 'all') {
        filtered = filtered.filter(g => g.campeonato === camp);
    }
    
    if (stat !== 'all') {
        filtered = filtered.filter(g => g.status === stat);
    }

    renderGames(filtered);
}

// Iniciar a aplicação
document.addEventListener('DOMContentLoaded', loadGames);
