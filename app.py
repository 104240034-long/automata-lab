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

    trans_map = {}
    alphabet = set()
    
    # 1. Build the transition map and deduce the alphabet
    for t in raw_transitions:
        symbols = [s.strip() for s in t.get('symbol', '').split(',') if s.strip()]
        alphabet.update(symbols) 
        
        for sym in symbols:
            key = (t['from'], sym)
            
            if key in trans_map:
                return jsonify({
                    "trace": [], 
                    "status": "Error", 
                    "message": f"Invalid DFA: State '{t['from']}' has multiple transitions for symbol '{sym}'."
                })
                
            trans_map[key] = t['to']

    # Include characters from the test string in the alphabet
    alphabet.update(list(test_string))

    # 2. Strict DFA check: Abort immediately if the DFA is not legal
    for s in states:
        state_id = s['id']
        for sym in alphabet:
            if (state_id, sym) not in trans_map:
                # Returning "Error" tells app.tsx to disable animations immediately
                return jsonify({
                    "trace": [],
                    "status": "Error",
                    "message": f"Illegal DFA: Node '{state_id}' is missing an edge for symbol '{sym}'."
                })

    # 3. Safe Simulation (Only runs if the DFA passed strict validation)
    current_state = start_state
    trace = [current_state]

    for char in test_string:
        current_state = trans_map[(current_state, char)]
        trace.append(current_state)

    status = "Pass" if current_state in accept_states else "Fail"
    
    return jsonify({
        "trace": trace,
        "status": status,
        "message": "Simulation complete"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)