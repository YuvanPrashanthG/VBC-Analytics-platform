import warnings
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
import pandas as pd
import joblib
import numpy as np
import json
# --- IMPORTANT: Import the specific exception classes ---
from pymssql._mssql import MSSQLDriverException
import pymssql 

# Import the Database class from your database.py file
from database import Database

# Suppress inconsistent version warnings from scikit-learn
warnings.filterwarnings("ignore", category=UserWarning, module='sklearn')
warnings.filterwarnings("ignore", category=UserWarning, module='pickle')


# --- App Setup ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_key_change_this'

# --- Login Manager Setup ---
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# <<<=====   ADD THE GLOBAL DATABASE ERROR HANDLER CODE HERE    =====>>>

@app.errorhandler(MSSQLDriverException)
@app.errorhandler(pymssql.exceptions.OperationalError)
def handle_database_connection_error(e):
    """
    Catches database connection errors globally, logs them,
    and shows a user-friendly error page.
    """
    app.logger.error(f"DATABASE CONNECTION ERROR: {e}")

    return render_template(
        "error.html",
        error_code=500,
        message="Database connection failed. Please try again later.",
        request=request
    ), 500

# --- Database and Model Loading ---
db = Database()
cost_model = joblib.load('./ml_models/vbc_cost_model_1.pkl')
risk_data = pd.read_csv('./data/aco_risk_predictions_2025.csv')
vdc_data = pd.read_csv('./data/vdc_with_aco.csv')
with open('./data/aco_data_full_provider_names.json', 'r') as f:
    aco_data_json = json.load(f)

# --- User Class for Flask-Login (Simplified) ---
class User(UserMixin):
    def __init__(self, id, role):
        self.id = id
        self.role = role

@login_manager.user_loader
def load_user(user_id):
    """Loads a user by their primary UserID from the new Users table."""
    user_data = db.execute_query("SELECT * FROM dbo.Users WHERE UserID = %s", (user_id,), fetchone=True)
    if user_data:
        return User(id=user_data['UserID'], role=user_data['Role'])
    return None

# --- Main Routes ---

@app.route('/')
def root():
    """Redirects the root URL to the login page."""
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash('Email and password are required.', 'danger')
            return redirect(url_for('login'))

        user_data = db.execute_query("SELECT * FROM dbo.Users WHERE Email = %s", (email,), fetchone=True)

        if user_data and user_data['Password'] == password:
            user = User(id=user_data['UserID'], role=user_data['Role'])
            login_user(user)
            
            if user.role == 'aco':
                session['aco_id'] = user_data.get('AcoID')
                if not session.get('aco_id'):
                    flash('Login failed: Could not determine your ACO ID.', 'danger')
                    logout_user()
                    return redirect(url_for('login'))
                
                flash('ACO login successful!', 'success')
                return redirect(url_for('aco_home'))

            elif user.role == 'cms':
                flash('CMS login successful!', 'success')
                return redirect(url_for('index'))
        else:
            flash('Invalid email or password. Please try again.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

@app.route('/home')
@login_required
def index():
    if current_user.role != 'cms':
        flash('Access denied. You do not have permission to view this page.', 'danger')
        return redirect(url_for('login'))
    return render_template('index.html')


@app.route('/aco_home')
@login_required
def aco_home():
    """Renders the home page for logged-in ACO users."""
    if current_user.role != 'aco':
        flash('Access denied. You do not have permission to view this page.', 'danger')
        return redirect(url_for('login'))
    
    return render_template('aco_index.html')

# --- Other Application Routes (add role checks as needed) ---

@app.route('/about')
@login_required
def about():
    return render_template('about.html')

@app.route('/analysis')
@login_required
def analysis():
    return render_template('analysis.html')

@app.route('/contact')
@login_required
def contact():
    return render_template('contact.html')

@app.route('/models')
@login_required
def models():
    return render_template('models.html')

@app.route('/cms_dashboard')
@login_required
def cms_dashboard():
    return render_template('cms_dashboard.html')

@app.route('/risk_dashboard')
@login_required
def risk_dashboard():
    return render_template('risk_dashboard.html')

@app.route('/model_cost')
@login_required
def model_cost():
    aco_names = sorted(vdc_data['ACO_Name'].unique())
    return render_template('Model_Cost.html', aco_names=aco_names, prediction=None)

@app.route('/model_what_if')
@login_required
def model_what_if():
    return render_template('Model_What_If.html')
    
@app.route('/aco_list')
@login_required
def aco_list():
    sorted_acos = sorted(aco_data_json, key=lambda x: x['qualityScore'], reverse=True)
    return render_template('aco_list.html', acos=sorted_acos)

@app.route('/aco/<string:aco_id>')
@login_required
def aco_dashboard(aco_id):
    if current_user.role == 'aco' and session.get('aco_id') != aco_id:
        flash('Access Denied: You do not have permission to view this dashboard.', 'danger')
        return redirect(url_for('aco_dashboard', aco_id=session.get('aco_id')))

    aco = next((item for item in aco_data_json if item["id"] == aco_id), None)
    if aco is None:
        return "ACO not found", 404
    return render_template('aco_detail.html', aco=aco)

# --- CORRECTED DASHBOARD ROUTE ---
@app.route('/sep_dashboard/<string:aco_id>')
@login_required
def sep_aco_dashboard(aco_id):
    """ Renders the new, separate dashboard page for a single ACO. """
    # Security check to ensure an ACO user can only see their own dashboard
    # FIX: Use the correct session key 'aco_id'
    if current_user.role == 'aco' and session.get('aco_id') != aco_id:
        flash('Access Denied: You cannot view another ACO\'s dashboard.', 'danger')
        # FIX: Use the correct session key 'aco_id' here as well
        return redirect(url_for('sep_aco_dashboard', aco_id=session.get('aco_id')))

    aco = next((item for item in aco_data_json if item["id"] == aco_id), None)
    if aco is None:
        return "ACO not found", 404
    return render_template('sep_aco_dashboard.html', aco=aco)
# --- API and Prediction Routes ---

@app.route('/api/risk_data')
@login_required
def api_risk_data():
    return jsonify(risk_data.to_dict(orient='records'))


from groq import Groq

groq_client = Groq(api_key="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")
# Initialize Groq client (requires GROQ_API_KEY in environment variables)

@app.route("/api/chat", methods=["POST"])
@login_required
def chatbot_api():
    """
    Chatbot endpoint backed by Groq LLM.
    """
    payload = request.get_json(force=True)
    user_message = payload.get("message", "").strip()

    if not user_message:
        return jsonify({"response": "Please type something for me to respond to."})

    try:
        # Define your system prompt
        system_prompt = (
            "You are \"VBC Advisor,\" a specialized AI assistant for Medicare Value-Based Care (VBC) contracts. "
            "STRICT RULES:\n"
            "1. ONLY answer questions about Medicare ACO programs, CMS regulations, value-based care, and quality metrics\n"
            "2. For ANY non-VBC questions (healthcare general, insurance, non-Medicare topics, off-topic), respond EXACTLY: "
            "\"I specialize exclusively in Medicare Value-Based Care and ACO programs. Please ask questions related to CMS regulations, quality metrics, or financial models in value-based care.\"\n"
            "3. Be concise (2-3 lines maximum)\n"
            "4. Never show formulas/calculations - only summarize outcomes\n"
            "5. Respond to the greeting\n"
            "6. If quality metrics are discussed, suggest improvements when relevant"
        )

        # Call Groq chat completion
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=300
        )

        response_text = completion.choices[0].message.content.strip()

        return jsonify({"response": response_text})

    except Exception as e:
        app.logger.error(f"Groq error: {str(e)}")
        fallback_responses = [
            "I'm currently experiencing technical difficulties with my AI engine. Please try again later.",
            "I apologize, but I'm unable to connect to my knowledge base at the moment.",
            "Thank you for your question. For the most accurate information, please consult the official CMS guidelines directly."
        ]
        return jsonify({"response": fallback_responses[np.random.randint(0, len(fallback_responses))]}), 500
    
    
@app.route("/api/aco_summary/<string:aco_id>", methods=["GET"])
@login_required
def aco_summary(aco_id):
    """
    Generate a short natural language summary of an ACO's dashboard data using Groq LLM.
    """
    # Find the ACO JSON object
    aco = next((item for item in aco_data_json if item["id"] == aco_id), None)
    if not aco:
        return jsonify({"error": "ACO not found"}), 404

    try:
        system_prompt = (
            "You are a Medicare Value-Based Care dashboard summarizer. "
            "Given structured JSON with ACO performance data, generate a short (3–5 sentence) "
            "summary of the key insights from the charts. "
            "Focus on: spending vs benchmark, quality score, shared savings/losses, "
            "per-beneficiary expenditure, and penalties. "
            "Be concise and factual. Avoid repeating raw numbers unnecessarily."
        )

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(aco)}
            ],
            temperature=0.4,
            max_tokens=250
        )

        summary = completion.choices[0].message.content.strip()
        return jsonify({"summary": summary})

    except Exception as e:
        app.logger.error(f"Groq summary error: {str(e)}")
        return jsonify({"summary": "Unable to generate summary at the moment."}), 500
    
    

@app.route('/cost_predict', methods=['POST'])
@login_required
def cost_predict():
    try:
        aco_name = request.form['aco_name']
        n_ab = request.form.get('N_AB')
        gen_save_loss = request.form.get('GenSaveLoss')

        latest_data = vdc_data[vdc_data['ACO_Name'] == aco_name].iloc[-1]
        input_df = pd.DataFrame([latest_data])

        if n_ab:
            input_df['N_AB'] = float(n_ab)
        if gen_save_loss:
            input_df['GenSaveLoss'] = float(gen_save_loss)
            
        model_features = cost_model.named_steps['scaler'].feature_names_in_
        prediction_input = input_df[model_features]
        prediction = cost_model.predict(prediction_input)
        
        aco_names = sorted(vdc_data['ACO_Name'].unique())
        
        return render_template('Model_Cost.html', aco_names=aco_names, prediction=prediction[0])

    except Exception as e:
        flash(f'An error occurred during prediction: {e}', 'danger')
        return redirect(url_for('model_cost'))

# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True)

