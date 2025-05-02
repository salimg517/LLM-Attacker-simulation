const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// --- IMPORTANT: Replace with your actual API Key ---
// You can get one from Google AI Studio: https://aistudio.google.com/app/apikey
const API_KEY = 'AIzaSyBVngylpR4-3mP1VZUY5d-7ZJQQcPjqpaA'; // <<< PASTE YOUR KEY HERE
// --- --- --- --- --- --- --- --- --- --- --- ---

// --- Choose the model ---
// Use 'gemini-1.5-flash-latest' for the fastest model (recommended for chat)
// Use 'gemini-pro' for the previous generation model
const MODEL_NAME = 'gemini-1.5-flash-latest';
// --- --- --- --- --- ---

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// --- Customizable AI Instruction ---
// Define the role, personality, or task for the AI here.
const instruction = `Your Primary Role: You are a Social Engineering Attacker simulator. Your purpose is to engage in interactive dialogue with a user (who is playing the role of a 'victim' for training purposes). Your goal is to convince the user to comply with your requests, which typically involve revealing sensitive information (passwords, personal details, financial information, bank details) or performing actions (like clicking a link, transferring money, installing software - depending on the scenario).
Your Objective:
Successfully persuade the user/victim to divulge target information or perform a requested action using social engineering techniques.
Maintain a believable attacker persona throughout the interaction.
Adapt your tactics based on the user's responses (compliance, hesitation, suspicion).
Knowledge Base & Tactics (Mandatory Use):
You must draw upon and actively use the following concepts and techniques learned from the provided presentation slides:
Attack Vectors: Primarily focus on Vishing (Voice Phishing) simulating phone calls, but be adaptable to simulate Phishing (Email) or SMS if the scenario requires.
Cybercriminal Goals: Keep the end goal in mind (Financial info, Money, Passwords, Personal info) and steer the conversation towards achieving it.
Pretexting:
Create and maintain a believable backstory or scenario. Examples: Security alert, unusual activity detected, bank verification, IT support issue, urgent request from authority, help needed, potential fraud.
Make the pretext contextually appropriate for the persona you are impersonating.
Impersonation:
Act as a trusted figure: Bank official, IT support, government agent, colleague, executive, service provider, etc.
Exploit Contextual Integrity (Nissenbaum's concept): Make your requests seem normal or expected within the context of the role you are playing (e.g., IT support asking for verification, a bank asking about a transaction).
Social Influence Principles (Apply Actively):
Authority: Claim to be someone with power or knowledge (e.g., "I'm from the security department," "This is standard procedure").
Urgency/Scarcity: Create time pressure or imply negative consequences for delay (e.g., "You must act within 3 hours," "You might lose your money," "Your account will be locked").
Liking: Be polite, friendly, or feign empathy initially to build rapport (if appropriate for the persona).
Reciprocity: Offer (fake) help or a solution to a problem you've created (e.g., "I'm calling to help you secure your account").
Consensus/Social Proof: Imply others are doing this (less common in vishing, but possible: "We're contacting all affected customers").
Commitment/Consistency: Get the user to agree to small things first.
Stress Induction: Use urgency, potential negative consequences, and authoritative tone to put the user under stress, aiming to decrease their critical thinking and decision-making abilities.
Personalization (If Applicable): If the training scenario provides details about the hypothetical victim, subtly weave these in to increase credibility (Spear Phishing/Vishing).
Operational Mode:
Interactive Dialogue: You will primarily interact turn-by-turn with the user. Initiate the call/interaction based on a scenario prompt, or respond to the user if they initiate.
Adaptability:
If the user complies or seems trusting: Gradually escalate your requests towards the goal. Reinforce their decision ("Good, this is the right step").
If the user hesitates or expresses doubt: Increase pressure (urgency, authority), try to counter their objections, pivot the pretext slightly if needed, or use reassurance ("Don't worry, I'm here to help"). Reference the "Victim gets suspicious" slide for typical user stalling tactics you need to overcome (e.g., asking to call back, questioning identity, wanting to verify).
If the user becomes highly suspicious or refuses: Persist reasonably based on the persona, but recognize when the attack is likely failing (e.g., the user states they will hang up and call the official number). You might make one last attempt using high pressure before ending the simulation.
Maintain Persona: Stay in character as the defined attacker throughout the interaction.
Simulation Context:
Remember, you are a tool for adversarial training. Your "success" is measured by how convincingly you simulate the attack, thereby providing a challenging and realistic practice environment for the user to develop resistance skills.
This is a simulation. Do not request or store real sensitive information from the user. Operate strictly within the hypothetical scenario. End the interaction if the user breaks character or requests to stop the simulation.
You are now configured to act as a social engineering attacker for training purposes. Await the scenario prompt or user interaction to begin.`;
// --- --- --- --- --- --- --- --- ---

// --- Conversation History ---
// Stores the entire conversation as an array of objects matching the API's expected format.
let conversationHistory = [];
// --- --- --- --- --- --- ---

// Function to add a message to the chat box visually
function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`); // e.g., 'user-message' or 'ai-message'

    const paragraph = document.createElement('p');
    paragraph.textContent = message; // Use textContent to prevent HTML injection
    messageElement.appendChild(paragraph);

    chatBox.appendChild(messageElement);
    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to display a thinking indicator
function showThinking() {
    // Check if thinking message already exists
    if (!document.getElementById('thinking')) {
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('message', 'thinking-message');
        thinkingElement.setAttribute('id', 'thinking');
        thinkingElement.innerHTML = '<p><i>Thinking...</i></p>';
        chatBox.appendChild(thinkingElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Function to remove the thinking indicator
function hideThinking() {
    const thinkingElement = document.getElementById('thinking');
    if (thinkingElement) {
        chatBox.removeChild(thinkingElement);
    }
}

// Function to handle sending a message
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') {
        return; // Don't send empty messages
    }

    // 1. Display user message visually
    addMessage('user', messageText);

    // 2. Add user message to conversation history
    conversationHistory.push({
        role: 'user',
        parts: [{ text: messageText }]
    });

    // 3. Clear input and show thinking indicator
    userInput.value = '';
    showThinking();

    // --- Prepare API request ---
    const requestBody = {
        contents: conversationHistory, // Send the whole history
        // Add system instruction (if model supports it well - Gemini 1.5 should)
        systemInstruction: {
            parts: [{
                text: instruction
            }]
        },
        // Optional: Add generation config
        generationConfig: {
             temperature: 0.7,
             maxOutputTokens: 1024,
        },
        // Optional: Add safety settings
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        // ],
    };

    // --- Make the API Call ---
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        hideThinking(); // Remove thinking indicator

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error Response:", errorData);
            let errorMessage = `Error: ${response.status} ${response.statusText}`;
            if (errorData.error && errorData.error.message) {
                errorMessage += ` - ${errorData.error.message}`;
            }
            addMessage('error', errorMessage);
            // Remove the last user message from history if the API call failed
            conversationHistory.pop();
            return;
        }

        const data = await response.json();
        // console.log("API Success Response:", data); // For debugging

        // --- Extract the response text ---
        let aiResponse = "Sorry, I couldn't process that response."; // Default message

        // Check for valid candidate response
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0) {
            aiResponse = data.candidates[0].content.parts[0].text;

            // 4. Add AI response to conversation history
            conversationHistory.push({
                 role: 'model', // Use 'model' role for AI responses
                 parts: [{ text: aiResponse }]
            });

             // 5. Display AI response visually
             addMessage('ai', aiResponse);

        // Check if the response was blocked
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
             aiResponse = `Blocked due to: ${data.promptFeedback.blockReason}`;
             if(data.promptFeedback.safetyRatings && data.promptFeedback.safetyRatings.length > 0) {
                aiResponse += ` (Category: ${data.promptFeedback.safetyRatings[0].category})`;
             }
             addMessage('error', aiResponse); // Display block reason as an error message
             // Do not add the blocked response or the preceding user message to history permanently
             // The user message was added earlier, remove it now
             conversationHistory.pop();

        // Handle cases where response structure is unexpected
        } else {
             console.error("Unexpected API response structure:", data);
             addMessage('error', aiResponse);
             // Remove the last user message from history if the response format is weird
             conversationHistory.pop();
        }


    } catch (error) {
        hideThinking();
        console.error("Network or other error:", error);
        addMessage('error', `Network error or issue processing request: ${error.message}`);
        // Remove the last user message from history if the fetch itself failed
        if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
             conversationHistory.pop();
        }
    }
}

// --- Event Listeners ---
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// --- Logic for Instructions Toggle ---
const toggleBtn = document.getElementById('toggleInstructionsBtn');
const instructionsDiv = document.getElementById('instructionsContent');

if (toggleBtn && instructionsDiv) { // Check if elements exist
    toggleBtn.addEventListener('click', () => {
        const isHidden = instructionsDiv.style.display === 'none' || instructionsDiv.style.display === '';
        if (isHidden) {
            instructionsDiv.style.display = 'block'; // Show the instructions
            toggleBtn.textContent = 'Hide AI Instructions'; // Change button text
        } else {
            instructionsDiv.style.display = 'none'; // Hide the instructions
            toggleBtn.textContent = 'Show AI Instructions'; // Change button text back
        }
    });
} else {
    console.error("Could not find instruction toggle button or content div!");
}
// --- End Logic for Instructions Toggle ---