// Leitor de QR Code
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const notifier = require('node-notifier');

// Inicializando o cliente com autenticação persistente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Inicializa o cliente
client.initialize();

// Função de delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Respostas aleatórias
const respostasCardapio = [
    "📄 Aqui está o nosso cardápio atualizado! Confira as opções deliciosas. 😋",
    "🍽️ Veja nosso cardápio completo abaixo!",
    "📖 Enviando agora o nosso cardápio para você!"
];

const respostasPedido = [
    "✅ Seu pedido foi iniciado! Um atendente entrará em contato em breve. Se preferir, ligue para 📞 3446-3201.",
    "🍽️ Estamos preparando tudo! Em breve, alguém do time vai te chamar. Se demorar, ligue para 3446-3201.",
    "🔔 Pedido recebido! Um atendente cuidará de tudo. Qualquer dúvida, entre em contato conosco!"
];

const estados = new Map();

// Quando o bot estiver pronto
client.on('ready', () => {
    console.log('✅ Bot está online!');
});

// Tratamento de mensagens
client.on('message', async message => {
    // Normaliza o texto
    const texto = message.body.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const saudacoes = /\b(oi+|ola|olá|boa\s+(tarde|noite|dia))\b/i;

    if (saudacoes.test(texto)) {
        await message.reply(
`👋 Olá! Seja muito bem-vindo ao *Portal da Carne de Sol*!

🍽️ Funcionamos *todos os dias* das *11h às 23h*  
🚚 Delivery: das *10h às 22h*

Como podemos te ajudar hoje? Escolha uma opção:

1️⃣ - Ver Cardápio 📖  
2️⃣ - Fazer Pedido 🍛  
3️⃣ - Reservar Mesa 📅  
4️⃣ - Ver Localização 📍  
5️⃣ - Falar com Atendente ☎️`
        );
        await delay(1000);
        return;
    }

    // Verifica opções do menu
    const chat = await message.getChat();
    await chat.sendStateTyping();
    

    if (texto === '1') {
        const resposta = respostasCardapio[Math.floor(Math.random() * respostasCardapio.length)];
        await message.reply(resposta);
        await delay(1000);
        const media = MessageMedia.fromFilePath('./arquivo.pdf'); // Substitua pelo seu PDF
        await client.sendMessage(message.from, media);

        } else if (texto === '2') {
            estados.set(from, 'pedido_telefone');
            await message.reply('📋 Vamos iniciar seu pedido! Por favor, envie seu telefone de cadastro:');
            return;
        }

        if (estados.has(from)) {
            const estado = estados.get(from);

            if (estado === 'pedido_telefone') {
            // Guarda telefone, pede endereço
            estados.set(from, 'pedido_endereco');
            await message.reply('🏠 Agora, envie seu endereço completo:');
            return;
            }

            if (estado === 'pedido_endereco') {
            estados.set(from, 'pedido_prato');
            await message.reply('🍛 Qual prato deseja pedir?');
            return;
            }

            if (estado === 'pedido_prato') {
            estados.set(from, 'pedido_pagamento');
            await message.reply(
        `💳 Escolha a forma de pagamento digitando o número correspondente:

        1️⃣ - Dinheiro  
        2️⃣ - Cartão  
        3️⃣ - Pix`
            );
            return;
            }

            if (estado === 'pedido_pagamento') {
            if (texto === '1') {
                estados.delete(from);
                await message.reply('💵 Você escolheu *Dinheiro*. Você precisará de troco? Por favor, informe o valor ou digite "não".');
            } else if (texto === '2') {
                estados.delete(from);
                await message.reply('💳 Você escolheu *Cartão*. O atendente irá confirmar o pagamento.');
            } else if (texto === '3') {
                estados.delete(from);
                await message.reply('📲 Você escolheu *Pix*. Nossa chave Pix é: 12345-67890@banco');
            } else {
                await message.reply('❌ Opção inválida! Por favor, digite 1, 2 ou 3.');
            }
            return;
            }

        notifier.notify({
            title: "🍽️ Novo Pedido",
            message: `Pedido recebido de ${message.from}`,
            sound: true,
            wait: true
        });
        console.log(`🔔 Novo pedido de ${message.from}`);

        //         const resposta = respostasPedido[Math.floor(Math.random() * respostasPedido.length)];
        //         await message.reply(resposta);
        //         await delay(1000);
        //         await client.sendMessage(message.from,
        // `📋 Para continuar seu pedido, envie as seguintes informações e aguarde a confirmação do atendente:

        // 📞 *Telefone de cadastro:*  
        // 🏠 *Endereço completo:*  
        // 🍛 *Prato desejado:*  
        // 💳 *Forma de pagamento:* (Ex: Pix, Cartão, Dinheiro)`
        //         );

    } else if (texto === '3') {
        await client.sendMessage(message.from,
`📅 Para reservar uma mesa, envie:

👥 *Quantidade de pessoas:*  
🕒 *Horário desejado:*  
📆 *Data:*  
🏞️ *Preferência de local (opcional):*`);

    } else if (texto === '4') {
        await client.sendMessage(message.from,
`📍 Estamos te esperando aqui:

https://www.google.com.br/maps/place/Portal+da+Carne+de+Sol/@-8.0484462,-34.9308061,16.25z/data=!4m6...`);

    } else if (texto === '5') {
        await client.sendMessage(message.from,
`📞 Para atendimento direto, entre em contato com a gente:

📱 *(81) 9 9134-3997*  
☎️ *3446-3201*

Estamos prontos para te atender! 💬`);

    }
});

