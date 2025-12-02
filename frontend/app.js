window.addEventListener("DOMContentLoaded", async () => {
    const contractAddress = "0x0755D2CebcFf1aE73Ad9853D36f3E535Ef295F20";
    const abi = [
        {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
        {"inputs":[],"name":"projectName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"goal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalFunds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"fund","outputs":[],"stateMutability":"payable","type":"function"},
        {"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"refund","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"donorCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"donors","outputs":[{"internalType":"address","name":"donor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"}
    ];
    const connectBtn = document.getElementById("connectBtn");
    const fundBtn = document.getElementById("fundBtn");
    const withdrawBtn = document.getElementById("withdrawBtn");
    const refundBtn = document.getElementById("refundBtn");
    const projectNameEl = document.getElementById("projectName");
    const descriptionEl = document.getElementById("description");
    const goalEl = document.getElementById("goal");
    const totalFundsEl = document.getElementById("totalFunds");
    const ownerEl = document.getElementById("owner");
    const amountInput = document.getElementById("amount");
    const progressFill = document.getElementById("progress");
    const donationList = document.getElementById("donationList");
    let provider, signer, contract;
    connectBtn.onclick = async () => {
        if (!window.ethereum) {
            alert("Установите MetaMask!");
            return;
        }
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            const account = await signer.getAddress();
            connectBtn.innerText = "Подключено: " + account.slice(0, 6) + "...";
            loadContractData();
        } catch (err) {
            console.error(err);
            alert("Ошибка подключения: " + err.message);
        }
    };
    async function loadContractData() {
        if (!contract) return;
        const name = await contract.projectName();
        const desc = await contract.description();
        const goal = await contract.goal();
        const total = await contract.totalFunds();
        const owner = await contract.owner();
        projectNameEl.textContent = name;
        descriptionEl.textContent = desc;
        goalEl.textContent = ethers.formatEther(goal);
        totalFundsEl.textContent = ethers.formatEther(total);
        ownerEl.textContent = owner;
        const progressPercent = Math.min(100, Number(ethers.formatEther(total)) /
            Number(ethers.formatEther(goal)) * 100);
        progressFill.style.width = progressPercent + "%";
        donationList.innerHTML = "";
        const donorCount = await contract.donorCount();
        for (let i = 0; i < donorCount; i++) {
            const d = await contract.donors(i);
            if (Number(d.amount) > 0) {
                const li = document.createElement("li");
                li.textContent = `${d.donor}: ${ethers.formatEther(d.amount)} ETH`;
                donationList.appendChild(li);
            }
        }
    }
    fundBtn.onclick = async () => {
        if (!contract) return alert("Сначала подключите MetaMask!");
        const ethAmount = amountInput.value;
        if (!ethAmount || Number(ethAmount) <= 0) return alert("Введите корректное количество ETH");
        try {
            await (await contract.fund({
                value: ethers.parseEther(ethAmount)
            })).wait();
            loadContractData();
        } catch (err) {
            console.error(err);
            alert("Ошибка пожертвования: " + err.message);
        }
    };
    withdrawBtn.onclick = async () => {
        if (!contract) return alert("Сначала подключите MetaMask!");
        try {
            await (await contract.withdraw()).wait();
            loadContractData();
        } catch (err) {
            console.error(err);
            alert("Ошибка вывода: " + err.message);
        }
    };
    refundBtn.onclick = async () => {
        if (!contract) return alert("Сначала подключите MetaMask!");
        try {
            await (await contract.refund()).wait();
            loadContractData();
        } catch (err) {
            console.error(err);
            alert("Ошибка возврата: " + err.message);
        }
    };
});