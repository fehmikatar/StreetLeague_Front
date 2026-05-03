

import pandas as pd
import numpy as np
import os
import json
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def etape2_nettoyage():
    print("=" * 60)
    print("  ETAPE 2 : NETTOYAGE DES DONNEES")
    print("=" * 60)

    df = pd.read_csv(os.path.join(BASE_DIR, "user_behavior.csv"))
    print(f"\n[1] Chargement: {df.shape[0]} lignes, {df.shape[1]} colonnes")


    print("\n[2] Valeurs manquantes:")
    missing = df.isnull().sum()
    if missing.sum() == 0:
        print("    Aucune valeur manquante")
    else:
        for col in df.columns:
            if missing[col] > 0:
                print(f"    {col}: {missing[col]} manquantes")
        df = df.fillna(0)


    dups = df.duplicated().sum()
    print(f"\n[3] Doublons: {dups}")
    if dups > 0:
        df = df.drop_duplicates()

    print("\n[4] Valeurs aberrantes:")
    for col in ['prix', 'recommendation_score', 'click_duration_seconds', 'search_frequency_in_category']:
        q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
        iqr = q3 - q1
        outliers = ((df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)).sum()
        print(f"    {col}: {outliers} outliers")

    print("\n[5] Encodage des variables categoriques:")
    label_encoders = {}
    for col in ['category_name', 'product_name', 'product_type', 'searched_size', 'product_status']:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        print(f"    {col}: {len(le.classes_)} valeurs")

    for col in ['size_available', 'is_preferred_category', 'is_in_favorites',
                'added_to_favorites', 'is_clicked', 'is_purchased']:
        df[col] = df[col].astype(int)
    print("\n[6] Booleens convertis en int")

    scaler = StandardScaler()
    cols_norm = ['prix', 'stock', 'click_duration_seconds', 'search_frequency_in_category']
    df[cols_norm] = scaler.fit_transform(df[cols_norm])
    print("\n[7] Normalisation appliquee")

    print("\n[8] Distribution par categorie:")
    for cat in df['category_name'].unique():
        cat_df = df[df['category_name'] == cat]
        avg_score = cat_df['recommendation_score'].mean()
        favs = cat_df['is_in_favorites'].sum()
        pref = cat_df['is_preferred_category'].sum()
        print(f"    {cat:15s}: {len(cat_df):4d} rows | score_moy={avg_score:.1f} | favs={favs} | pref={pref}")

    clean_path = os.path.join(BASE_DIR, "user_behavior_clean.csv")
    df.to_csv(clean_path, index=False, encoding='utf-8')
    print(f"\n[OK] Sauvegarde: {clean_path}")

    return df, label_encoders, scaler


def etape3_entrainement(df):
    print("\n" + "=" * 60)
    print("  ETAPE 3 : ENTRAINEMENT DU MODELE")
    print("  Objectif: Predire le recommendation_score (0-100)")
    print("  -> Plus le score est eleve, plus le produit est affiche en 1er")
    print("=" * 60)

    feature_cols = [
        'user_id', 'product_id', 'category_id',
        'category_name_encoded', 'product_type_encoded',
        'searched_size_encoded', 'size_available',
        'is_preferred_category', 'search_frequency_in_category',
        'is_in_favorites', 'prix', 'stock',
        'product_status_encoded',
    ]
    target_col = 'recommendation_score'

    X = df[feature_cols].values
    y = df[target_col].values

    print(f"\n[1] Features ({len(feature_cols)}):")
    for f in feature_cols:
        print(f"    - {f}")
    print(f"\n[2] Target: {target_col}")
    print(f"    Min={y.min():.1f} | Max={y.max():.1f} | Mean={y.mean():.1f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"\n[3] Split 80/20: Train={X_train.shape[0]} | Test={X_test.shape[0]}")

    models = {
        "RandomForest": RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=150, max_depth=6, learning_rate=0.1, random_state=42),
        "LinearRegression": LinearRegression(),
    }

    results = {}
    best_model = None
    best_r2 = -999

    print(f"\n[4] Entrainement de {len(models)} modeles:\n")

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2 * 100, 2)}

        print(f"  --- {name} ---")
        print(f"    MAE:  {mae:.2f} (erreur moyenne)")
        print(f"    RMSE: {rmse:.2f}")
        print(f"    R2:   {r2*100:.2f}% (qualite du modele)")
        print()

        if r2 > best_r2:
            best_r2 = r2
            best_model = (name, model)

    if hasattr(models["RandomForest"], "feature_importances_"):
        print("\n[5] Feature Importance (RandomForest):")
        importances = models["RandomForest"].feature_importances_
        sorted_idx = np.argsort(importances)[::-1]
        for i in sorted_idx:
            bar = "#" * int(importances[i] * 50)
            print(f"    {feature_cols[i]:35s}: {importances[i]*100:5.2f}% {bar}")

    print(f"\n[6] Meilleur modele: {best_model[0]} (R2={best_r2*100:.2f}%)")
    model_path = os.path.join(BASE_DIR, "best_model.pkl")
    with open(model_path, 'wb') as f:
        pickle.dump(best_model[1], f)

    meta_path = os.path.join(BASE_DIR, "training_results.json")
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump({
            "best_model": best_model[0],
            "best_r2": round(best_r2 * 100, 2),
            "feature_columns": feature_cols,
            "models": results,
        }, f, indent=2, ensure_ascii=False)

    print(f"    Modele: {model_path}")
    print(f"    Resultats: {meta_path}")

    return best_model, feature_cols, results



def etape4_prediction(best_model, feature_cols, df, label_encoders):
    print("\n" + "=" * 60)
    print("  ETAPE 4 : PREDICTION & CLASSEMENT")
    print("  -> Affiche les produits par ORDRE de recommandation")
    print("=" * 60)

    model_name, model = best_model

    print(f"\n[1] Simulation: Utilisateur qui cherche en Football, taille M\n")

    user_data = df[df['user_id'] == 1].copy()
    if len(user_data) == 0:
        user_data = df.head(20).copy()

    X_user = user_data[feature_cols].values
    predicted_scores = model.predict(X_user)
    user_data['predicted_score'] = predicted_scores

    user_data_sorted = user_data.sort_values('predicted_score', ascending=False)

    print("  Rang | Produit                  | Categorie    | Taille  | Fav | Pref Cat | Score Predit")
    print("  " + "-" * 100)

    for rank, (_, row) in enumerate(user_data_sorted.head(15).iterrows(), 1):
        fav = "OUI" if row['is_in_favorites'] else "non"
        pref = "OUI" if row['is_preferred_category'] else "non"
        print(f"  {rank:4d} | {row['product_name']:24s} | {row['category_name']:12s} | {row['searched_size']:7s} | {fav:3s} | {pref:8s} | {row['predicted_score']:.1f}")

    print(f"\n\n[2] Top 3 produits recommandes PAR CATEGORIE pour User 1:\n")

    all_products_data = df.copy()
    X_all = all_products_data[feature_cols].values
    all_products_data['predicted_score'] = model.predict(X_all)

    for cat in sorted(df['category_name'].unique()):
        cat_data = all_products_data[
            (all_products_data['category_name'] == cat) &
            (all_products_data['user_id'] == 1)
        ].sort_values('predicted_score', ascending=False).head(3)

        if len(cat_data) == 0:
            continue

        print(f"  [{cat}]")
        for _, row in cat_data.iterrows():
            fav = "*FAV*" if row['is_in_favorites'] else ""
            print(f"    -> {row['product_name']:25s} | Score: {row['predicted_score']:.1f} | Taille: {row['searched_size']} {fav}")
        print()

    print(f"\n[3] Impact de la TAILLE sur la recommandation:")
    size_avail = all_products_data.groupby('size_available')['predicted_score'].mean()
    print(f"    Taille disponible:     score moyen = {size_avail.get(1, 0):.1f}")
    print(f"    Taille non disponible: score moyen = {size_avail.get(0, 0):.1f}")

    print(f"\n[4] Impact des FAVORIS sur la recommandation:")
    fav_scores = all_products_data.groupby('is_in_favorites')['predicted_score'].mean()
    print(f"    Dans les favoris:      score moyen = {fav_scores.get(1, 0):.1f}")
    print(f"    Pas dans les favoris:  score moyen = {fav_scores.get(0, 0):.1f}")

    print(f"\n[5] Impact de la CATEGORIE PREFEREE:")
    pref_scores = all_products_data.groupby('is_preferred_category')['predicted_score'].mean()
    print(f"    Categorie preferee:    score moyen = {pref_scores.get(1, 0):.1f}")
    print(f"    Autre categorie:       score moyen = {pref_scores.get(0, 0):.1f}")

    pred_output = []
    for cat in sorted(df['category_name'].unique()):
        cat_data = all_products_data[all_products_data['category_name'] == cat]
        top = cat_data.sort_values('predicted_score', ascending=False).head(5)
        for _, row in top.iterrows():
            pred_output.append({
                "category": cat,
                "product": row['product_name'],
                "predicted_score": round(row['predicted_score'], 2),
                "is_favorite": bool(row['is_in_favorites']),
                "is_preferred_category": bool(row['is_preferred_category']),
                "searched_size": row['searched_size'],
                "size_available": bool(row['size_available']),
            })

    pred_path = os.path.join(BASE_DIR, "predictions_ranking.json")
    with open(pred_path, 'w', encoding='utf-8') as f:
        json.dump(pred_output, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Classement sauvegarde: {pred_path}")



def main():
    print("\n" + "#" * 60)
    print("  PIPELINE ML - SPONSOR STREETLEAGUE")
    print("  Recommandation: categorie + taille + favoris")
    print("#" * 60)

    df, label_encoders, scaler = etape2_nettoyage()
    best_model, feature_cols, results = etape3_entrainement(df)
    etape4_prediction(best_model, feature_cols, df, label_encoders)

    print("\n" + "=" * 60)
    print("  PIPELINE TERMINE!")
    print("=" * 60)
    print("  Fichiers:")
    print("    - user_behavior_clean.csv    (dataset nettoye)")
    print("    - best_model.pkl             (modele entraine)")
    print("    - training_results.json      (resultats)")
    print("    - predictions_ranking.json   (classement produits)")
    print("=" * 60)


if __name__ == "__main__":
    main()
