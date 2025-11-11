# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)
# CORS(app, origins=["http://localhost:8081", "http://localhost:8081"], supports_credentials=True)

# @app.route("/api/diagnose", methods=["POST"])
# def diagnose():
#     internal_key = request.headers.get("x-internal-key")
#     print(internal_key)
#     if internal_key != os.getenv("INTERNAL_SHARED_KEY"):
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.get_json()
#     print("Received payload:", data)
#     return jsonify({"message": "Payload received successfully", "received_features": list(data.keys())}), 200

# if __name__ == "__main__":
#     app.run(port=int(os.getenv("PORT", 3000)), debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sys
from pyds import MassFunction
from itertools import product
import os

# Ensure proper path loading for pyds
sys.path.append(".")

# --- Load BPA data once ---
BPA_PATH = './bpa_conf_full.csv'
ALLERGY_TEST_PATH = './allergy_test.csv'

bpa_data = pd.read_csv(BPA_PATH)
bpa_data.set_index('A/C', inplace=True)

# --- Default values (must match frontend logic) ---
DEFAULTS = {
    # Demographics
    "Age": "G1",
    "Sex": "M",
    "Fhistory": "N",
    # Symptoms
    "runningnose": "N",
    "sneeze": "N",
    "cough": "N",
    "wheezeBlocks": "N",
    "headache": "N",
    "itching": "N",
    "swelling": "N",
    "redrashes": "N",
}

# Add allergen defaults
reaction_levels = ["housedust","cottondust","aspergilus","pollen","parthenium",
                   "cockroach","catdander","dosfur","roaddust","oldpdust","PSdust",
                   "MilkP","MilkC","curd","coffee","tea","beef","chicken","mutton",
                   "egg","fishA","fishB","crab","prawns","shark","banana","beans",
                   "brinjal","cabbage","capsicum","carrot","cauliflower","corn",
                   "drumstick","greens","mango","mushroom","onion","peas","potato",
                   "tomato","wheat","rice","maida","ragi","oats","spices","nuts",
                   "coconut","oil","garlic","ginger","pepper","tamarind",
                   "aginomoto","coco","horlicks","boost"]

for r in reaction_levels:
    DEFAULTS[r] = "NA"

# --- Initialize Flask ---
app = Flask(__name__)
CORS(app)

# --- Utility: DSS logic ---
def DSS(input_arr, bpa_data):
    test = pd.read_csv(ALLERGY_TEST_PATH)
    temp_test = test.iloc[:, :-1]
    list_col = list(temp_test.columns)

    df = bpa_data
    test_bpa_single = []
    c = 0

    for a in input_arr:
        if c == len(list_col):
            break
        if str(a) == "KR":
            c += 1
            continue
        else:
            s = f"{list_col[c]} {a}"
            if s in df.index:
                row = df.loc[s].copy()
                # Avoid zeros
                row[row == 0] = 0.0001
                test_bpa_single.append(dict(row))
            else:
                # If combination not found
                test_bpa_single.append(dict(pd.Series(
                    [0.0001] * 7, index=['R', 'O', 'N', 'RU', 'U', 'UO', 'RO'], name=s)))
            c += 1

    if not test_bpa_single:
        return {"error": "No valid BPA data found"}

    initial = MassFunction(test_bpa_single[0])
    for i in range(1, len(test_bpa_single)):
        initial = initial & MassFunction(test_bpa_single[i])
    return str(initial)

# --- Prediction endpoint ---
@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    data = request.get_json() or {}
    print("\n--- Incoming Payload ---")
    print(data)

    # Merge with defaults
    merged = DEFAULTS.copy()
    merged.update(data)

    print("\n--- Merged Input ---")
    print(merged)

    # Build ordered feature array
    try:
        test_df = pd.read_csv(ALLERGY_TEST_PATH)
        list_col = list(test_df.iloc[:, :-1].columns)
    except Exception as e:
        return jsonify({"error": f"Error reading allergy test CSV: {str(e)}"}), 500

    # Extract ordered values or defaults
    input_arr = [merged.get(col, "KR") for col in list_col]

    # Convert final gender at end if required (old logic compatibility)
    if "Sex" in merged:
        if merged["Sex"] == "Male":
            merged["Sex"] = "M"
        elif merged["Sex"] == "Female":
            merged["Sex"] = "F"

    print("\n--- Ordered Input Array ---")
    print(input_arr)

    try:
        answer = DSS(input_arr, bpa_data)
        if isinstance(answer, dict) and "error" in answer:
            return jsonify(answer), 400

        parts = [x.split(":")[-1] for x in answer.split(";") if ":" in x]
        parts[-1] = parts[-1].replace("}", "").strip()

        response = dict(zip(['U', 'R', 'O', 'UR', 'UO', 'RO', 'N'], parts))
        print("\n--- DSS Output ---")
        print(response)

        return jsonify({
            "message": "Diagnosis computed successfully",
            "result": response
        })
    except Exception as e:
        print("Error in DSS:", e)
        return jsonify({"error": str(e)}), 500

# --- Run ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)
