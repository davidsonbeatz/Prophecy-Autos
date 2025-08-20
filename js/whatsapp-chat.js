/**
 * WhatsApp Chat Integration for Prophecy Autos
 * This script enhances the WhatsApp chat button with additional functionality
 * including chat history, automated responses, and user interaction tracking.
 */

class WhatsAppChat {
    constructor(options) {
        this.options = Object.assign({
            phoneNumber: '1234567890',  // Default phone number (without country code)
            welcomeMessage: 'Hello! Welcome to Prophecy Autos. How can we assist you today?',
            autoResponse: true,
            businessHours: {
                monday: { open: '09:00', close: '18:00' },
                tuesday: { open: '09:00', close: '18:00' },
                wednesday: { open: '09:00', close: '18:00' },
                thursday: { open: '09:00', close: '18:00' },
                friday: { open: '09:00', close: '18:00' },
                saturday: { open: '09:00', close: '17:00' },
                sunday: { open: '10:00', close: '16:00' }
            },
            offHoursMessage: 'Thank you for contacting Prophecy Autos. We are currently closed. Our business hours are Monday-Friday 9AM-6PM, Saturday 9AM-5PM, and Sunday 10AM-4PM. We will respond to your message during business hours.',
            quickResponses: [
                { text: 'I want to inquire about a vehicle', value: 'vehicle_inquiry' },
                { text: 'I need service/maintenance information', value: 'service_info' },
                { text: 'I want to schedule a test drive', value: 'test_drive' },
                { text: 'I need financing information', value: 'financing' },
                { text: 'I want to discuss a trade-in', value: 'trade_in' }
            ],
            position: 'right', // 'right' or 'left'
            delay: 2000,      // Delay before showing the chat popup in milliseconds
            rememberUser: true, // Remember user using localStorage
            headerColor: '#4CAF50',
            headerTextColor: '#ffffff',
            buttonColor: '#4CAF50',
            buttonTextColor: '#ffffff'
        }, options);

        this.isOpen = false;
        this.chatHistory = [];
        this.userInfo = {};
        this.init();
    }

    init() {
        this.createChatButton();
        this.createChatWidget();
        this.bindEvents();
        this.loadUserData();
        
        // Show chat widget with delay if enabled
        if (this.options.delay > 0) {
            setTimeout(() => {
                if (!this.hasInteracted() && !this.isOpen) {
                    this.toggleChat();
                }
            }, this.options.delay);
        }
    }

    createChatButton() {
        // Check if the button already exists (from HTML)
        let existingButton = document.querySelector('.whatsapp-btn');
        
        if (existingButton) {
            this.chatButton = existingButton;
            // Update the href to ensure it uses the configured phone number
            this.chatButton.href = `https://wa.me/${this.options.phoneNumber}`;
        } else {
            // Create new button if none exists
            this.chatButton = document.createElement('a');
            this.chatButton.className = 'whatsapp-btn';
            this.chatButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
            this.chatButton.href = `https://wa.me/${this.options.phoneNumber}`;
            this.chatButton.target = '_blank';
            document.body.appendChild(this.chatButton);
        }
        
        // Override the default click behavior
        this.chatButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleChat();
        });
    }

    createChatWidget() {
        // Create chat widget container
        this.chatWidget = document.createElement('div');
        this.chatWidget.className = 'whatsapp-chat-widget';
        this.chatWidget.style.display = 'none';
        this.chatWidget.style.position = 'fixed';
        this.chatWidget.style.bottom = '80px';
        this.chatWidget.style.right = this.options.position === 'right' ? '20px' : 'auto';
        this.chatWidget.style.left = this.options.position === 'left' ? '20px' : 'auto';
        this.chatWidget.style.width = '320px';
        this.chatWidget.style.maxHeight = '500px';
        this.chatWidget.style.backgroundColor = '#fff';
        this.chatWidget.style.borderRadius = '10px';
        this.chatWidget.style.overflow = 'hidden';
        this.chatWidget.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.2)';
        this.chatWidget.style.zIndex = '999';
        this.chatWidget.style.transition = 'all 0.3s ease';
        
        // Create chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';
        chatHeader.style.backgroundColor = this.options.headerColor;
        chatHeader.style.color = this.options.headerTextColor;
        chatHeader.style.padding = '15px';
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        // Add dealership logo and name
        const headerLogo = document.createElement('div');
        headerLogo.className = 'chat-header-logo';
        headerLogo.style.display = 'flex';
        headerLogo.style.alignItems = 'center';
        
        const logoIcon = document.createElement('div');
        logoIcon.innerHTML = '<i class="fab fa-whatsapp" style="font-size: 24px; margin-right: 10px;"></i>';
        
        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = `
            <h3 style="margin: 0; font-size: 16px;">Prophecy Autos</h3>
            <p style="margin: 0; font-size: 12px;">Typically replies within an hour</p>
        `;
        
        headerLogo.appendChild(logoIcon);
        headerLogo.appendChild(headerTitle);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = this.options.headerTextColor;
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.lineHeight = '1';
        closeButton.addEventListener('click', () => this.toggleChat());
        
        chatHeader.appendChild(headerLogo);
        chatHeader.appendChild(closeButton);
        
        // Create chat body
        this.chatBody = document.createElement('div');
        this.chatBody.className = 'chat-body';
        this.chatBody.style.padding = '15px';
        this.chatBody.style.height = '300px';
        this.chatBody.style.overflowY = 'auto';
        this.chatBody.style.backgroundColor = '#E5DDD5';
        this.chatBody.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'64\' height=\'64\' viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z\' fill=\'%239C92AC\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")';
        
        // Add welcome message
        this.addMessage(this.options.welcomeMessage, 'received');
        
        // Create quick responses
        this.quickResponsesContainer = document.createElement('div');
        this.quickResponsesContainer.className = 'quick-responses';
        this.quickResponsesContainer.style.padding = '10px 15px';
        this.quickResponsesContainer.style.borderTop = '1px solid #e0e0e0';
        this.quickResponsesContainer.style.backgroundColor = '#f5f5f5';
        
        const quickResponsesTitle = document.createElement('p');
        quickResponsesTitle.textContent = 'Quick Responses:';
        quickResponsesTitle.style.margin = '0 0 10px';
        quickResponsesTitle.style.fontSize = '14px';
        quickResponsesTitle.style.color = '#666';
        
        this.quickResponsesContainer.appendChild(quickResponsesTitle);
        
        // Add quick response buttons
        this.options.quickResponses.forEach(response => {
            const button = document.createElement('button');
            button.textContent = response.text;
            button.dataset.value = response.value;
            button.style.backgroundColor = '#f0f0f0';
            button.style.border = '1px solid #ddd';
            button.style.borderRadius = '15px';
            button.style.padding = '8px 12px';
            button.style.margin = '0 5px 5px 0';
            button.style.fontSize = '13px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s ease';
            
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#e0e0e0';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#f0f0f0';
            });
            
            button.addEventListener('click', () => {
                this.handleQuickResponse(response);
            });
            
            this.quickResponsesContainer.appendChild(button);
        });
        
        // Create chat input area
        const chatFooter = document.createElement('div');
        chatFooter.className = 'chat-footer';
        chatFooter.style.padding = '10px';
        chatFooter.style.borderTop = '1px solid #e0e0e0';
        chatFooter.style.display = 'flex';
        
        this.chatInput = document.createElement('input');
        this.chatInput.type = 'text';
        this.chatInput.placeholder = 'Type a message...';
        this.chatInput.style.flex = '1';
        this.chatInput.style.padding = '10px';
        this.chatInput.style.border = '1px solid #ddd';
        this.chatInput.style.borderRadius = '20px';
        this.chatInput.style.outline = 'none';
        
        const sendButton = document.createElement('button');
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        sendButton.style.backgroundColor = this.options.buttonColor;
        sendButton.style.color = this.options.buttonTextColor;
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '50%';
        sendButton.style.width = '40px';
        sendButton.style.height = '40px';
        sendButton.style.marginLeft = '10px';
        sendButton.style.cursor = 'pointer';
        
        chatFooter.appendChild(this.chatInput);
        chatFooter.appendChild(sendButton);
        
        // Assemble the widget
        this.chatWidget.appendChild(chatHeader);
        this.chatWidget.appendChild(this.chatBody);
        this.chatWidget.appendChild(this.quickResponsesContainer);
        this.chatWidget.appendChild(chatFooter);
        
        // Add to document
        document.body.appendChild(this.chatWidget);
        
        // Event listeners for input
        sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    bindEvents() {
        // Track user interaction with the page
        document.addEventListener('click', () => {
            this.setInteracted(true);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.adjustWidgetPosition();
        });
    }

    adjustWidgetPosition() {
        // Adjust widget position based on screen size
        if (window.innerWidth < 768) {
            this.chatWidget.style.width = '90%';
            this.chatWidget.style.right = '5%';
            this.chatWidget.style.left = '5%';
        } else {
            this.chatWidget.style.width = '320px';
            this.chatWidget.style.right = this.options.position === 'right' ? '20px' : 'auto';
            this.chatWidget.style.left = this.options.position === 'left' ? '20px' : 'auto';
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.chatWidget.style.display = 'block';
            // Add a small delay before adding the class to trigger animation
            setTimeout(() => {
                this.chatWidget.style.opacity = '1';
                this.chatWidget.style.transform = 'translateY(0)';
            }, 10);
            this.chatInput.focus();
            this.scrollToBottom();
        } else {
            this.chatWidget.style.opacity = '0';
            this.chatWidget.style.transform = 'translateY(20px)';
            setTimeout(() => {
                this.chatWidget.style.display = 'none';
            }, 300); // Match the transition duration
        }
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (message) {
            // Add user message to chat
            this.addMessage(message, 'sent');
            this.chatInput.value = '';
            
            // Save to chat history
            this.chatHistory.push({
                text: message,
                type: 'sent',
                timestamp: new Date().toISOString()
            });
            
            // Process the message
            this.processUserMessage(message);
            
            // Save user data if enabled
            if (this.options.rememberUser) {
                this.saveUserData();
            }
        }
    }

    processUserMessage(message) {
        // Check if within business hours
        if (this.options.autoResponse && !this.isWithinBusinessHours()) {
            setTimeout(() => {
                this.addMessage(this.options.offHoursMessage, 'received');
                this.chatHistory.push({
                    text: this.options.offHoursMessage,
                    type: 'received',
                    timestamp: new Date().toISOString()
                });
            }, 1000);
            return;
        }
        
        // Simple keyword-based responses
        setTimeout(() => {
            let responseMessage = '';
            
            if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
                responseMessage = 'Our vehicle prices vary based on make, model, and condition. You can view our inventory online or visit our showroom for detailed pricing information. Would you like to inquire about a specific vehicle?';
            } else if (message.toLowerCase().includes('test drive') || message.toLowerCase().includes('drive')) {
                responseMessage = 'We'd be happy to arrange a test drive for you! Please let us know which vehicle you're interested in and your preferred date and time. Alternatively, you can call us at (123) 456-7890 to schedule.';
            } else if (message.toLowerCase().includes('trade') || message.toLowerCase().includes('trade-in')) {
                responseMessage = 'We offer competitive trade-in valuations. To get started, please provide details about your vehicle (make, model, year, condition, mileage). Our team will get back to you with an estimate.';
            } else if (message.toLowerCase().includes('finance') || message.toLowerCase().includes('loan')) {
                responseMessage = 'We offer various financing options to suit different needs and credit situations. Our finance team can help you find the best rates and terms. Would you like us to contact you about financing options?';
            } else if (message.toLowerCase().includes('hours') || message.toLowerCase().includes('open')) {
                responseMessage = 'Our showroom is open Monday-Friday 9AM-6PM, Saturday 9AM-5PM, and Sunday 10AM-4PM. Our service department is open Monday-Friday 8AM-5PM and Saturday 8AM-2PM.';
            } else {
                responseMessage = 'Thank you for your message. One of our representatives will respond shortly. If you need immediate assistance, please call us at (123) 456-7890.';
            }
            
            this.addMessage(responseMessage, 'received');
            this.chatHistory.push({
                text: responseMessage,
                type: 'received',
                timestamp: new Date().toISOString()
            });
        }, 1000);
    }

    handleQuickResponse(response) {
        // Add the quick response text as a user message
        this.addMessage(response.text, 'sent');
        
        // Save to chat history
        this.chatHistory.push({
            text: response.text,
            type: 'sent',
            timestamp: new Date().toISOString()
        });
        
        // Process based on response type
        setTimeout(() => {
            let responseMessage = '';
            
            switch(response.value) {
                case 'vehicle_inquiry':
                    responseMessage = 'Thank you for your interest in our vehicles. To help you better, could you please specify what type of vehicle you are looking for (make, model, year, budget)?';
                    break;
                case 'service_info':
                    responseMessage = 'Our service department offers comprehensive maintenance and repair services. We're open Monday-Friday 8AM-5PM and Saturday 8AM-2PM. Would you like to schedule a service appointment?';
                    break;
                case 'test_drive':
                    responseMessage = 'We'd be happy to arrange a test drive for you! Please let us know which vehicle you're interested in and your preferred date and time.';
                    break;
                case 'financing':
                    responseMessage = 'We offer competitive financing options with flexible terms and rates. Our finance experts can help find the best solution for your situation. Would you like us to contact you about specific financing options?';
                    break;
                case 'trade_in':
                    responseMessage = 'We offer fair market value for trade-ins. To provide you with an estimate, please share details about your vehicle (make, model, year, mileage, condition).';
                    break;
                default:
                    responseMessage = 'Thank you for your message. How else can we assist you today?';
            }
            
            this.addMessage(responseMessage, 'received');
            this.chatHistory.push({
                text: responseMessage,
                type: 'received',
                timestamp: new Date().toISOString()
            });
        }, 1000);
    }

    addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.style.maxWidth = '80%';
        messageElement.style.padding = '10px 15px';
        messageElement.style.marginBottom = '10px';
        messageElement.style.borderRadius = '18px';
        messageElement.style.position = 'relative';
        messageElement.style.wordBreak = 'break-word';
        
        if (type === 'sent') {
            messageElement.style.backgroundColor = '#DCF8C6';
            messageElement.style.marginLeft = 'auto';
            messageElement.style.borderBottomRightRadius = '5px';
        } else {
            messageElement.style.backgroundColor = '#FFFFFF';
            messageElement.style.marginRight = 'auto';
            messageElement.style.borderBottomLeftRadius = '5px';
        }
        
        messageElement.textContent = text;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.style.fontSize = '10px';
        timestamp.style.color = '#999';
        timestamp.style.textAlign = type === 'sent' ? 'right' : 'left';
        timestamp.style.marginTop = '5px';
        
        const now = new Date();
        timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageElement.appendChild(timestamp);
        
        this.chatBody.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    isWithinBusinessHours() {
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;
        
        if (!this.options.businessHours[day]) {
            return false;
        }
        
        const openTime = this.options.businessHours[day].open.split(':');
        const closeTime = this.options.businessHours[day].close.split(':');
        
        const openMinutes = parseInt(openTime[0]) * 60 + parseInt(openTime[1]);
        const closeMinutes = parseInt(closeTime[0]) * 60 + parseInt(closeTime[1]);
        
        return currentTime >= openMinutes && currentTime <= closeMinutes;
    }

    hasInteracted() {
        if (this.options.rememberUser) {
            return localStorage.getItem('whatsapp_chat_interacted') === 'true';
        }
        return false;
    }

    setInteracted(value) {
        if (this.options.rememberUser) {
            localStorage.setItem('whatsapp_chat_interacted', value.toString());
        }
    }

    saveUserData() {
        if (this.options.rememberUser) {
            localStorage.setItem('whatsapp_chat_history', JSON.stringify(this.chatHistory));
            localStorage.setItem('whatsapp_user_info', JSON.stringify(this.userInfo));
        }
    }

    loadUserData() {
        if (this.options.rememberUser) {
            const chatHistory = localStorage.getItem('whatsapp_chat_history');
            const userInfo = localStorage.getItem('whatsapp_user_info');
            
            if (chatHistory) {
                this.chatHistory = JSON.parse(chatHistory);
                
                // Display last few messages from history (max 5)
                const recentMessages = this.chatHistory.slice(-5);
                recentMessages.forEach(msg => {
                    this.addMessage(msg.text, msg.type);
                });
            }
            
            if (userInfo) {
                this.userInfo = JSON.parse(userInfo);
            }
        }
    }

    // Public method to open the chat
    open() {
        if (!this.isOpen) {
            this.toggleChat();
        }
    }

    // Public method to close the chat
    close() {
        if (this.isOpen) {
            this.toggleChat();
        }
    }

    // Public method to update options
    updateOptions(newOptions) {
        this.options = Object.assign(this.options, newOptions);
        // Refresh UI elements that depend on options
        this.chatButton.href = `https://wa.me/${this.options.phoneNumber}`;
    }
}

// Initialize the WhatsApp chat when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with your phone number and options
    window.prophecyAutosChat = new WhatsAppChat({
        phoneNumber: '15551234567',  // Using the number from the HTML file
        welcomeMessage: 'Welcome to Prophecy Autos! How can we assist you with your automotive needs today?',
        headerColor: '#25D366', // Updated to WhatsApp brand color
        buttonColor: '#25D366', // Updated to WhatsApp brand color
        autoResponse: true,
        rememberUser: true,
        delay: 3000 // Increased delay for better user experience
    });
});