// Leitor de QR Code
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');

// Inicializando o cliente do WhatsApp SEM autenticação persistente
const client = new Client({
    puppeteer: { headless: true }
});

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Iniciando o cliente
client.initialize();

// Função para adicionar um delay entre as mensagens
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Respostas para os diferentes serviços
const respostasCardapio = [
    "Aqui está o nosso cardápio! Enviando o PDF...",
    "O cardápio está disponível em:",
    "Você pode ver nosso cardápio clicando no link abaixo:"
];

const respostasPedido = [
    "Seu pedido será atendido por um atendente em breve.",
    "Fique tranquilo, seu pedido já está sendo processado.",
    "Em breve, um atendente estará à disposição para finalizar seu pedido!"
];

const respostasPromocao = [
    "Aqui está as promoções dessa semana:",
    "A seguir as promoções desta semana!",
    "Boa escolha, vamos lhe enviar as promoções da semana!"
];

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('✅ Bot está online!');
});

// Quando uma nova mensagem chegar
client.on('message', async message => {
    const texto = message.body.trim(); // Remove espaços extras

    if (texto.match(/(menu|teste)/i)) {
        await message.reply("Olá! Escolha uma opção:\n1️ - Cardápio 📖\n2️⃣ - Fazer Pedido 🍽️\n3️⃣ - Promoções da Semana 📢");
        await delay(1000);
    }

    // Verifica se o usuário digitou "1" ou "2"
    if (texto === '1') {
        const respostaAleatoria = respostasCardapio[Math.floor(Math.random() * respostasCardapio.length)];
        const chat = await message.getChat(); // Obtém o chat correto
        await chat.sendStateTyping(); // Simulando Digitação
        await message.reply(respostaAleatoria);
        await delay(1000);
        const media = MessageMedia.fromFilePath('./caminho/para/cardapio.pdf'); // Defina o caminho correto
        await client.sendMessage(message.from, media);
    } else if (texto === '2') {
        const respostaAleatoria = respostasPedido[Math.floor(Math.random() * respostasPedido.length)];
        await chat.sendStateTyping(); // Simulando Digitação
        await message.reply(respostaAleatoria);
        await delay(1000);
        await client.sendMessage("Para adiantar pode preencher os dados a seguir\n Telefone de cadastro:\n Endereço:\n Prato desejado(Se já tiver escolhido):\n Forma de Pagamento:");
        console.log(`🔔 Novo pedido de ${message.from}`);
    } else if (texto === '3') {
        const respostaAleatoria = respostasPromocao[Math.floor(Math.random() * respostasPromocao.length)];
        await chat.sendStateTyping(); // Simulando Digitação
        await message.reply(respostaAleatoria);
        await delay(1000);
        const media = MessageMedia.fromFilePath('./caminho/para/promocao.pdf'); // Defina o caminho correto
        await client.sendMessage(message.from, media);
}});
