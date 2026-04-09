from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes so React can communicate with Flask
CORS(app)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({"status": "Connected"})

@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.json
    states = data.get('states', [])
    raw_transitions = data.get('transitions', [])
    start_state = data.get('start_state', '')
    test_string = data.get('test_string', '')

    # Map accept states for O(1) lookup
    accept_states = {s['id'] for s in states if s.get('isAccept')}

    # Build transition map and validate for DFA compliance
    trans_map = {}
    
    # THE BACKEND NOW HANDLES THE CALCULATION OF SPLITTING SYMBOLS
    for t in raw_transitions:
        # Split symbols by comma and remove extra whitespace
        symbols = [s.strip() for s in t.get('symbol', '').split(',') if s.strip()]
        
        for sym in symbols:
            key = (t['from'], sym)
            
            # DFA Validation: Prevent multiple paths for the same symbol
            if key in trans_map:
                return jsonify({
                    "trace": [], 
                    "status": "Error", 
                    "message": f"Non-deterministic logic: State '{t['from']}' has multiple transitions for symbol '{sym}'."
                })
                
            trans_map[key] = t['to']

    current_state = start_state
    trace = [current_state]

    # Process the input string character by character
    for char in test_string:
        key = (current_state, char)
        if key in trans_map:
            current_state = trans_map[key]
            trace.append(current_state)
        else:
            # Automaton crashed due to no valid transition
            return jsonify({
                "trace": trace, 
                "status": "Fail", 
                "message": f"Halted at {current_state}: No transition for '{char}'"
            })

    # Check if the final state is an accepting state
    status = "Pass" if current_state in accept_states else "Fail"
    
    return jsonify({
        "trace": trace,
        "status": status,
        "message": "Simulation complete"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)