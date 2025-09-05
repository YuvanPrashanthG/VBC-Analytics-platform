# Add this import at the top of app.py
import random

# Add this route to your app.py
@app.route('/chatbot', methods=['POST'])
@login_required
def chatbot():
    user_message = request.json.get('message', '')
    
    # Simple response logic - you can expand this with more sophisticated NLP
    user_message = user_message.lower()
    
    if any(word in user_message for word in ['hello', 'hi', 'hey', 'greetings']):
        response = "Hello! How can I help you with CMS VBC Analytics today?"
    elif any(word in user_message for word in ['aco', 'accountable care']):
        response = "Our ACO analysis provides detailed analytics for Accountable Care Organizations with provider-level insights and performance tracking. You can access it from the Analysis page."
    elif any(word in user_message for word in ['model', 'machine learning', 'ai']):
        response = "We offer several machine learning models including Cost Optimization, Risk Stratification, and What-If Simulator. You can explore them from the Models page."
    elif any(word in user_message for word in ['contact', 'support', 'help']):
        response = "You can contact our support team via email at support@cmsvbc.com or phone at +1 (443) 555-5678 during business hours (9 AM - 6 PM EST)."
    elif any(word in user_message for word in ['cost', 'pricing']):
        response = "For pricing information, please contact our sales team at sales@cmsvbc.com. They can provide detailed pricing based on your organization's needs."
    elif any(word in user_message for word in ['dashboard', 'analytics']):
        response = "Our analytics dashboard provides a comprehensive overview of CMS Value-Based Care programs. You can access it from the Analysis page after logging in."
    elif any(word in user_message for word in ['thank', 'thanks', 'appreciate']):
        response = "You're welcome! Is there anything else I can help you with?"
    else:
        responses = [
            "I'm not sure I understand. Could you please rephrase your question?",
            "That's an interesting question. Could you provide more details?",
            "I'm still learning about CMS VBC Analytics. Could you try asking something else?",
            "I don't have information about that yet. Please try asking about our ACO analysis, machine learning models, or contact information."
        ]
        response = random.choice(responses)
    
    return jsonify({'response': response})