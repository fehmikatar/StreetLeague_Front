"""
API Flask - Modele IA Recommandation Sponsor StreetLeague
Expose le modele ML via des endpoints REST
Spring Boot appelle cette API via RestTemplate
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Charger le modele au demarrage
MODEL = None
META = None

def load_model():
    global MODEL, META
    model_path = os.path.join(BASE_DIR, "best_model.pkl")
    meta_path = os.path.join(BASE_DIR, "training_results.json")
    
    with open(model_path, 'rb') as f:
        MODEL = pickle.load(f)
    with open(meta_path, 'r', encoding='utf-8') as f:
        META = json.load(f)
    
    print(f"Modele charge: {META['best_model']} | R2: {META['best_r2']}%")


@app.route('/api/health', methods=['GET'])
def health():
    """Verification que l'API est en ligne"""
    return jsonify({
        "status": "OK",
        "model": META['best_model'] if META else "Not loaded",
        "r2_score": META['best_r2'] if META else 0,
        "features": META['feature_columns'] if META else []
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predire le score de recommandation pour un produit/utilisateur
    
    Body JSON:
    {
        "user_id": 1,
        "product_id": 5,
        "category_id": 1,
        "category_name_encoded": 3,
        "product_type_encoded": 2,
        "searched_size_encoded": 5,
        "size_available": 1,
        "is_preferred_category": 1,
        "search_frequency_in_category": 8,
        "is_in_favorites": 1,
        "prix": 0.2,
        "stock": 0.5,
        "product_status_encoded": 0
    }
    """
    try:
        data = request.get_json()
        
        features = [
            data.get('user_id', 0),
            data.get('product_id', 0),
            data.get('category_id', 0),
            data.get('category_name_encoded', 0),
            data.get('product_type_encoded', 0),
            data.get('searched_size_encoded', 0),
            data.get('size_available', 0),
            data.get('is_preferred_category', 0),
            data.get('search_frequency_in_category', 0),
            data.get('is_in_favorites', 0),
            data.get('prix', 0),
            data.get('stock', 0),
            data.get('product_status_encoded', 0),
        ]
        
        score = MODEL.predict([features])[0]
        score = max(0, min(100, score))
        
        return jsonify({
            "recommendation_score": round(score, 2),
            "should_display_first": score > 70,
            "priority": "HIGH" if score > 70 else "MEDIUM" if score > 50 else "LOW"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/rank-products', methods=['POST'])
def rank_products():
    """
    Classer une liste de produits par ordre de recommandation pour un utilisateur
    
    Body JSON:
    {
        "user_id": 1,
        "products": [
            {
                "product_id": 5,
                "category_id": 1,
                "category_name_encoded": 3,
                "product_type_encoded": 2,
                "searched_size_encoded": 5,
                "size_available": true,
                "is_preferred_category": true,
                "search_frequency_in_category": 8,
                "is_in_favorites": true,
                "prix": 45.99,
                "stock": 50,
                "product_status_encoded": 0
            }
        ]
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id', 0)
        products = data.get('products', [])
        
        results = []
        for prod in products:
            features = [
                user_id,
                prod.get('product_id', 0),
                prod.get('category_id', 0),
                prod.get('category_name_encoded', 0),
                prod.get('product_type_encoded', 0),
                prod.get('searched_size_encoded', 0),
                1 if prod.get('size_available', False) else 0,
                1 if prod.get('is_preferred_category', False) else 0,
                prod.get('search_frequency_in_category', 0),
                1 if prod.get('is_in_favorites', False) else 0,
                prod.get('prix', 0),
                prod.get('stock', 0),
                prod.get('product_status_encoded', 0),
            ]
            
            score = MODEL.predict([features])[0]
            score = max(0, min(100, score))
            
            results.append({
                "product_id": prod.get('product_id'),
                "recommendation_score": round(score, 2),
                "priority": "HIGH" if score > 70 else "MEDIUM" if score > 50 else "LOW"
            })
        
        # Trier par score decroissant
        results.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        # Ajouter le rang
        for i, r in enumerate(results):
            r['rank'] = i + 1
        
        return jsonify({
            "user_id": user_id,
            "total_products": len(results),
            "ranked_products": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Informations sur le modele"""
    return jsonify({
        "model_name": META['best_model'],
        "r2_score": META['best_r2'],
        "feature_columns": META['feature_columns'],
        "all_models": META['models']
    })


if __name__ == '__main__':
    load_model()
    print("\n" + "=" * 50)
    print("  Flask API - Recommandation IA StreetLeague")
    print("  http://localhost:5000")
    print("=" * 50)
    print("\nEndpoints:")
    print("  GET  /api/health        - Status de l'API")
    print("  POST /api/predict       - Predire un score")
    print("  POST /api/rank-products - Classer des produits")
    print("  GET  /api/model-info    - Infos du modele")
    print("=" * 50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
