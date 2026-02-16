const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];
const element = document.getElementById("month");

let currentMonth = "";
let charIndex = 0;
let isDeleting = false;

function pickRandomMonth() {
    const randomIndex = Math.floor(Math.random() * months.length);
    return months[randomIndex];
}

function typeEffect() {
    if (!currentMonth) currentMonth = pickRandomMonth();
    
    if (!isDeleting) {
        element.textContent = currentMonth.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentMonth.length) {
            setTimeout(() => isDeleting = true, 1000);
        }
    } else {
        element.textContent = currentMonth.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            currentMonth = pickRandomMonth();
        }
    }

    setTimeout(typeEffect, isDeleting ? 100 : 70);
}

typeEffect();

function start() {
    document.getElementById("landing").style.display = "none";
    document.getElementById("step1").style.display = "flex";
}

function nextStep(current) {
    document.getElementById("step" + current).style.display = "none";
    document.getElementById("step" + (current + 1)).style.display = "flex";
}

function finish() {
    const income = Number(document.getElementById("income").value);
    const expenses = Number(document.getElementById("expenses").value);
    const currentSavings = Number(document.getElementById("currentSavings").value);
    const targetSavings = Number(document.getElementById("targetSavings").value);
    const dateValue = document.getElementById("date").value;

    if (income === null || income === undefined || income === "" ||
        expenses === null || expenses === undefined || expenses === "" ||
        currentSavings === null || currentSavings === undefined || currentSavings === "" ||
        targetSavings === null || targetSavings === undefined || targetSavings === "" ||
        !dateValue) {
        alert("Please complete all fields.");
        return;
    }

    if (targetSavings <= currentSavings) {
        alert("Target savings must be greater than current savings.");
        return;
    }

    const today = new Date();
    const targetDate = new Date(dateValue);

    today.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);

    const diffTime = targetDate - today;

    if (diffTime <= 0) {
        alert("Target date must be in the future.");
        return;
    }

    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    const goalAmount = targetSavings - currentSavings;

    const weeklyAvailable = income - expenses;
    const requiredPerWeek = goalAmount / diffWeeks;

    if (requiredPerWeek > weeklyAvailable) {
        document.getElementById("step3").style.display = "none";
        document.getElementById("result").style.display = "flex";

        document.getElementById("scenarioContent").innerHTML = `
            <p class="scenarioDescription">
                Based on your income, expenses, and timeline, this goal isn't achievable by your selected date.
            </p>

            <p class="bigSpend">
                You would need to save <strong>$${Math.ceil(requiredPerWeek)}</strong> per week
            </p>

            <p class="smallSave">
                But you only have $${weeklyAvailable} available per week.
            </p>

            <p>
                <strong>Consider extending your deadline, increasing income, or lowering your target.</strong>
            </p>
        `;

        return;
    }

    document.getElementById("step3").style.display = "none";
    document.getElementById("result").style.display = "flex";

    // Calculate scenarios based on how much extra to save beyond the minimum
    const extraAvailable = weeklyAvailable - requiredPerWeek;
    
    const scenarios = {
        splurge: {
            title: "Splurger",
            save: Math.round(requiredPerWeek),  // Save minimum needed
        },
        balanced: {
            title: "Balanced",
            save: Math.round(requiredPerWeek + extraAvailable * 0.5),  // Save minimum + 50% of extra
        },
        aggressive: {
            title: "Aggressive Saver",
            save: Math.round(requiredPerWeek + extraAvailable * 0.8),  // Save minimum + 80% of extra
        }
    };

    // Calculate spend amounts for each scenario
    Object.keys(scenarios).forEach(type => {
        const save = scenarios[type].save;
        scenarios[type].spend = Math.round(weeklyAvailable - save);
        scenarios[type].possible = true;  // All are possible since we passed the initial check
    });

    window.scenarios = scenarios;
    window.weeklyAvailable = weeklyAvailable;

    showScenario("balanced");
}

function showScenario(type) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelector(`[onclick="showScenario('${type}')"]`).classList.add("active");

    const s = window.scenarios[type];

    let description = "";

    if (type === "splurge") {
        description = "You like having room to enjoy your money while still making progress in the background. Saving doesn't need to feel restrictive, it just needs to be consistent. With your current numbers, if you want to utilise your spending power as much as you can while still hitting your goal, it is recommended that you";
    }

    if (type === "balanced") {
        description = "You like having a healthy mix of enjoying your money now while still building toward something bigger. This approach keeps spending predictable while making steady progress toward your goal each week. It's an ideal 'sweet spot' that helps you stay consistent long-term. With your current situation, it's ideal to";
    }

    if (type === "aggressive") {
        description = "You're focused on getting to your goal faster, even if it means dialing spending back for a while. This strategy builds momentum quickly and shortens the path to your target. Based on your finances, you should try to";
    }

    document.getElementById("scenarioContent").innerHTML = `
        <p class="scenarioDescription">${description}</p>

        <p class="bigSpend">
            spend up to <strong>$${s.spend}</strong> per week
        </p>

        <p class="smallSave">
            Saving about $${s.save} per week
        </p>
    `;
}