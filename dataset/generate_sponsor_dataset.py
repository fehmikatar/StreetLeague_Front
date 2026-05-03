"""
Script de generation du Dataset Sponsor - StreetLeague
Modele IA: Recommandation personnalisee basee sur:
  - Historique de recherche (categorie, taille)
  - Favoris de l'utilisateur
  - Comportement de navigation (clics, duree, achat)
  
Genere ~2000+ lignes couvrant toutes les categories sportives
"""

import csv
import random
import os
from datetime import datetime, timedelta

random.seed(42)

SPORT_CATEGORIES = [
    {"id": 1, "nom": "Football", "description": "Equipements et accessoires de football"},
    {"id": 2, "nom": "Basketball", "description": "Equipements et accessoires de basketball"},
    {"id": 3, "nom": "Tennis", "description": "Raquettes, balles et accessoires de tennis"},
    {"id": 4, "nom": "Running", "description": "Chaussures et vetements de course a pied"},
    {"id": 5, "nom": "Natation", "description": "Maillots, lunettes et accessoires de natation"},
    {"id": 6, "nom": "Cyclisme", "description": "Velos, casques et accessoires de cyclisme"},
    {"id": 7, "nom": "Boxe", "description": "Gants, protections et equipements de boxe"},
    {"id": 8, "nom": "Fitness", "description": "Equipements de musculation et fitness"},
    {"id": 9, "nom": "Volleyball", "description": "Ballons et filets de volleyball"},
    {"id": 10, "nom": "Handball", "description": "Ballons et equipements de handball"},
]


SIZES = {
    "vetement": ["XS", "S", "M", "L", "XL", "XXL"],
    "chaussure": ["38", "39", "40", "41", "42", "43", "44", "45"],
    "accessoire": ["Unique", "S/M", "L/XL"],
    "equipement": ["Junior", "Standard", "Pro"],
}


SPONSORS_DATA = {
    "Football": ["Nike Football", "Adidas Soccer", "Puma Sport", "Under Armour", "New Balance FC"],
    "Basketball": ["Nike Basketball", "Jordan Brand", "Spalding", "Wilson NBA", "AND1"],
    "Tennis": ["Wilson Tennis", "Head Sport", "Babolat", "Yonex Tennis", "Dunlop Sport"],
    "Running": ["Nike Running", "Asics", "New Balance Run", "Saucony", "Brooks Running"],
    "Natation": ["Speedo", "Arena", "TYR Sport", "Aqua Sphere", "Finis Swim"],
    "Cyclisme": ["Shimano", "Giant Bikes", "Trek Cycling", "Specialized", "Cannondale"],
    "Boxe": ["Everlast", "Venum", "Rival Boxing", "Cleto Reyes", "Winning Co"],
    "Fitness": ["Decathlon Fit", "Domyos", "Technogym", "Life Fitness", "Rogue Fitness"],
    "Volleyball": ["Mikasa", "Molten Sport", "Mizuno Volley", "Asics Volley", "Errea Sport"],
    "Handball": ["Hummel", "Kempa", "Select Sport", "Salming", "Adidas Handball"],
}

PRODUCTS_DATA = {
    "Football": [
        ("Ballon Match Pro", 45.99, "equipement"), ("Crampons Elite", 129.99, "chaussure"),
        ("Maillot Training", 59.99, "vetement"), ("Protege-tibias Carbon", 34.99, "accessoire"),
        ("Gants Gardien Pro", 79.99, "accessoire"), ("Short Match", 29.99, "vetement"),
        ("Chaussettes Performance", 14.99, "vetement"), ("Sac Sport XL", 49.99, "accessoire"),
    ],
    "Basketball": [
        ("Ballon Indoor/Outdoor", 39.99, "equipement"), ("Chaussures High-Top", 149.99, "chaussure"),
        ("Maillot Reversible", 44.99, "vetement"), ("Short Respirant", 34.99, "vetement"),
        ("Bandeau Elastique", 9.99, "accessoire"), ("Panier Portable", 199.99, "equipement"),
        ("Genouilleres Pro", 24.99, "accessoire"), ("Sac a Dos Basket", 54.99, "accessoire"),
    ],
    "Tennis": [
        ("Raquette Pro 300g", 189.99, "equipement"), ("Balles Championship x4", 12.99, "equipement"),
        ("Sac Raquettes 6R", 79.99, "accessoire"), ("Grip Overgrip x3", 8.99, "accessoire"),
        ("Chaussures Court Clay", 119.99, "chaussure"), ("Jupe/Short Sport", 39.99, "vetement"),
        ("Cordage Multifilament", 19.99, "accessoire"), ("Casquette UV Protect", 24.99, "accessoire"),
    ],
    "Running": [
        ("Chaussures Amorti Max", 159.99, "chaussure"), ("Montre GPS Sport", 249.99, "accessoire"),
        ("Legging Compression", 59.99, "vetement"), ("Brassiere Running", 34.99, "vetement"),
        ("Ceinture Hydratation", 29.99, "accessoire"), ("Veste Coupe-vent", 89.99, "vetement"),
        ("Chaussettes Anti-ampoules", 16.99, "vetement"), ("Lunettes Sport UV", 44.99, "accessoire"),
    ],
    "Natation": [
        ("Maillot Competition", 69.99, "vetement"), ("Lunettes Miroir", 29.99, "accessoire"),
        ("Bonnet Silicone", 9.99, "accessoire"), ("Plaquettes Nage", 19.99, "accessoire"),
        ("Pull Buoy Pro", 14.99, "equipement"), ("Palmes Courtes", 39.99, "equipement"),
        ("Serviette Microfibre XL", 24.99, "accessoire"), ("Sac Etanche 30L", 34.99, "accessoire"),
    ],
    "Cyclisme": [
        ("Casque Aero Route", 149.99, "accessoire"), ("Cuissard Gel Pad", 89.99, "vetement"),
        ("Maillot Respirant", 69.99, "vetement"), ("Gants Cycliste", 29.99, "accessoire"),
        ("Compteur GPS Velo", 199.99, "accessoire"), ("Bidon Isotherme", 14.99, "accessoire"),
        ("Lumieres LED Set", 34.99, "accessoire"), ("Pompe Portable", 24.99, "accessoire"),
    ],
    "Boxe": [
        ("Gants 12oz Pro", 89.99, "accessoire"), ("Sac de Frappe 120cm", 149.99, "equipement"),
        ("Protege-dents Custom", 19.99, "accessoire"), ("Bandages 4.5m x2", 12.99, "accessoire"),
        ("Corde a Sauter Speed", 24.99, "equipement"), ("Casque Sparring", 69.99, "accessoire"),
        ("Chaussures Boxe", 99.99, "chaussure"), ("Coquille Protection", 29.99, "accessoire"),
    ],
    "Fitness": [
        ("Halteres Reglables 20kg", 129.99, "equipement"), ("Tapis Yoga Premium", 49.99, "equipement"),
        ("Bandes Resistance Set", 29.99, "accessoire"), ("Kettlebell 16kg", 59.99, "equipement"),
        ("Corde Battle Rope 12m", 79.99, "equipement"), ("Banc Musculation", 199.99, "equipement"),
        ("Gants Musculation", 19.99, "accessoire"), ("Shaker Proteine 700ml", 12.99, "accessoire"),
    ],
    "Volleyball": [
        ("Ballon Officiel V5", 49.99, "equipement"), ("Genouilleres Gel", 29.99, "accessoire"),
        ("Chaussures Indoor", 89.99, "chaussure"), ("Filet Competition", 149.99, "equipement"),
        ("Maillot Equipe", 39.99, "vetement"), ("Short Leger", 24.99, "vetement"),
        ("Sac Ballons", 34.99, "accessoire"), ("Protege-doigts", 14.99, "accessoire"),
    ],
    "Handball": [
        ("Ballon Resine T3", 39.99, "equipement"), ("Chaussures Indoor Pro", 109.99, "chaussure"),
        ("Maillot Respirant", 44.99, "vetement"), ("Short Stretch", 29.99, "vetement"),
        ("Genouilleres Impact", 34.99, "accessoire"), ("Resine Grip 200ml", 9.99, "accessoire"),
        ("Sac Sport 50L", 44.99, "accessoire"), ("Protege-dents Sport", 14.99, "accessoire"),
    ],
}


def generate_base_date():
    start = datetime(2024, 1, 1)
    return start + timedelta(days=random.randint(0, 500))


def generate_user_profiles(num_users=150):
    """Chaque utilisateur a des preferences de categorie et taille"""
    profiles = {}
    for uid in range(1, num_users + 1):
        num_fav_cats = random.randint(1, 3)
        fav_cats = random.sample([c["nom"] for c in SPORT_CATEGORIES], num_fav_cats)

        pref_size_vetement = random.choice(SIZES["vetement"])
        pref_size_chaussure = random.choice(SIZES["chaussure"])

        profiles[uid] = {
            "user_id": uid,
            "preferred_categories": fav_cats,
            "preferred_size_vetement": pref_size_vetement,
            "preferred_size_chaussure": pref_size_chaussure,
            "search_count": {},  # compteur de recherches par categorie
            "fav_products": [],  # produits mis en favoris
        }
    return profiles


def generate_sponsors_csv(output_dir):
    filepath = os.path.join(output_dir, "sponsors.csv")
    rows = []
    sponsor_id = 1
    for cat in SPORT_CATEGORIES:
        cat_name = cat["nom"]
        for sponsor_name in SPONSORS_DATA[cat_name]:
            company = sponsor_name.replace(" ", "") + "Corp"
            daily_budget = round(random.uniform(50, 500), 2)
            remaining = round(daily_budget * random.uniform(0.1, 1.0), 2)
            cpc = round(random.uniform(0.10, 5.00), 2)
            is_active = random.choices([True, False], weights=[85, 15])[0]
            created = generate_base_date()
            total_clicks = random.randint(0, 5000)
            total_spent = round(total_clicks * cpc * random.uniform(0.5, 1.2), 2)
            rows.append({
                "sponsor_id": sponsor_id, "name": sponsor_name,
                "email": f"contact@{company.lower()}.com", "company_name": company,
                "daily_budget": daily_budget, "remaining_budget": remaining,
                "cpc_bid": cpc, "target_category_id": cat["id"],
                "target_category_name": cat_name, "is_active": is_active,
                "created_at": created.strftime("%Y-%m-%d %H:%M:%S"),
                "total_clicks": total_clicks, "total_spent": total_spent,
            })
            sponsor_id += 1
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  sponsors.csv: {len(rows)} lignes")
    return rows


def generate_products_csv(output_dir):
    filepath = os.path.join(output_dir, "products.csv")
    rows = []
    product_id = 1
    for cat in SPORT_CATEGORIES:
        cat_name = cat["nom"]
        for prod_name, base_price, prod_type in PRODUCTS_DATA[cat_name]:
            price = round(base_price * random.uniform(0.8, 1.3), 2)
            stock = random.randint(0, 200)
            status = "RUPTURE_DE_STOCK" if stock == 0 else random.choices(
                ["EN_STOCK", "RUPTURE_DE_STOCK", "EN_ARRIVAGE"], weights=[80, 5, 15])[0]
            # Generer les tailles disponibles
            available_sizes = SIZES.get(prod_type, ["Unique"])
            created = generate_base_date()
            rows.append({
                "product_id": product_id, "nom": prod_name,
                "marque": random.choice(SPONSORS_DATA[cat_name]),
                "description": f"{prod_name} de haute qualite pour {cat_name.lower()}",
                "prix": price, "stock": stock, "category_id": cat["id"],
                "category_name": cat_name, "product_type": prod_type,
                "available_sizes": "|".join(available_sizes),
                "status": status, "deleted": False,
                "created_at": created.strftime("%Y-%m-%d %H:%M:%S"),
            })
            product_id += 1
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  products.csv: {len(rows)} lignes")
    return rows


def generate_user_behavior_csv(output_dir, user_profiles, products):
    """
    Dataset principal: comportement utilisateur
    Chaque ligne = une interaction utilisateur-produit
    Inclut: recherche, favoris, categorie preferee, taille preferee
    """
    filepath = os.path.join(output_dir, "user_behavior.csv")
    rows = []
    row_id = 1

    for uid, profile in user_profiles.items():
        num_interactions = random.randint(10, 30)

        for _ in range(num_interactions):
            if random.random() < 0.70:
                fav_cat = random.choice(profile["preferred_categories"])
                cat_products = [p for p in products if p["category_name"] == fav_cat]
            else:
                cat_products = products
            
            if not cat_products:
                cat_products = products

            product = random.choice(cat_products)
            prod_type = product["product_type"]
            available_sizes = product["available_sizes"].split("|")

            if prod_type == "vetement":
                if random.random() < 0.60:
                    searched_size = profile["preferred_size_vetement"]
                else:
                    searched_size = random.choice(SIZES["vetement"])
            elif prod_type == "chaussure":
                if random.random() < 0.65:
                    searched_size = profile["preferred_size_chaussure"]
                else:
                    searched_size = random.choice(SIZES["chaussure"])
            else:
                searched_size = random.choice(available_sizes)

            size_available = searched_size in available_sizes

            is_preferred_category = product["category_name"] in profile["preferred_categories"]

            cat_name = product["category_name"]
            profile["search_count"][cat_name] = profile["search_count"].get(cat_name, 0) + 1
            search_frequency = profile["search_count"][cat_name]

            is_in_favorites = product["product_id"] in profile["fav_products"]


            recommendation_score = 0.0

            if is_preferred_category:
                recommendation_score += 30.0

            if size_available:
                recommendation_score += 25.0

            recommendation_score += min(search_frequency * 3, 20.0)

            if is_in_favorites:
                recommendation_score += 15.0

            if product["prix"] < 100:
                recommendation_score += 5.0

            if product["status"] == "EN_STOCK":
                recommendation_score += 5.0

            recommendation_score += random.uniform(-5, 5)
            recommendation_score = max(0, min(recommendation_score, 100))

            click_prob = recommendation_score / 130.0 
            is_clicked = random.random() < click_prob
            click_duration = random.randint(5, 180) if is_clicked else 0

            purchase_prob = (recommendation_score / 150.0) * 0.5
            is_purchased = is_clicked and random.random() < purchase_prob

            added_to_favorites = False
            if not is_in_favorites and recommendation_score > 60 and random.random() < 0.3:
                profile["fav_products"].append(product["product_id"])
                added_to_favorites = True

            interaction_time = generate_base_date() + timedelta(
                hours=random.randint(0, 23), minutes=random.randint(0, 59))

            rows.append({
                "interaction_id": row_id,
                "user_id": uid,
                "product_id": product["product_id"],
                "product_name": product["nom"],
                "category_id": product["category_id"],
                "category_name": cat_name,
                "product_type": prod_type,
                "searched_size": searched_size,
                "size_available": size_available,
                "is_preferred_category": is_preferred_category,
                "search_frequency_in_category": search_frequency,
                "is_in_favorites": is_in_favorites or added_to_favorites,
                "added_to_favorites": added_to_favorites,
                "prix": product["prix"],
                "stock": product["stock"],
                "product_status": product["status"],
                "is_clicked": is_clicked,
                "click_duration_seconds": click_duration,
                "is_purchased": is_purchased,
                "recommendation_score": round(recommendation_score, 2),
                "interaction_time": interaction_time.strftime("%Y-%m-%d %H:%M:%S"),
            })
            row_id += 1

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  user_behavior.csv: {len(rows)} lignes (DATASET PRINCIPAL)")
    return rows


def generate_user_profiles_csv(output_dir, profiles):
    """Sauvegarder les profils utilisateurs"""
    filepath = os.path.join(output_dir, "user_profiles.csv")
    rows = []
    for uid, p in profiles.items():
        rows.append({
            "user_id": uid,
            "preferred_categories": "|".join(p["preferred_categories"]),
            "preferred_size_vetement": p["preferred_size_vetement"],
            "preferred_size_chaussure": p["preferred_size_chaussure"],
            "num_favorites": len(p["fav_products"]),
            "total_searches": sum(p["search_count"].values()),
        })
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  user_profiles.csv: {len(rows)} lignes")
    return rows


def generate_summary(output_dir, sponsors, products, behaviors, profiles):
    filepath = os.path.join(output_dir, "dataset_summary.txt")
    total_clicked = sum(1 for b in behaviors if b["is_clicked"])
    total_purchased = sum(1 for b in behaviors if b["is_purchased"])
    total_fav = sum(1 for b in behaviors if b["is_in_favorites"])
    ctr = total_clicked / len(behaviors) * 100
    cvr = total_purchased / total_clicked * 100 if total_clicked else 0

    lines = [
        "=" * 60,
        "  DATASET SPONSOR - STREETLEAGUE",
        "  Modele: Recommandation par categorie, taille et favoris",
        "=" * 60,
        f"\nVOLUMES:",
        f"  Sponsors:          {len(sponsors)}",
        f"  Produits:          {len(products)}",
        f"  Profils Users:     {len(profiles)}",
        f"  Interactions:      {len(behaviors)}",
        f"\nMETRIQUES:",
        f"  CTR:               {ctr:.2f}%",
        f"  CVR:               {cvr:.2f}%",
        f"  Total clics:       {total_clicked}",
        f"  Total achats:      {total_purchased}",
        f"  Total favoris:     {total_fav}",
        f"\nPAR CATEGORIE:",
    ]
    for cat in SPORT_CATEGORIES:
        cat_b = [b for b in behaviors if b["category_name"] == cat["nom"]]
        clicked = sum(1 for b in cat_b if b["is_clicked"])
        pref = sum(1 for b in cat_b if b["is_preferred_category"])
        fav = sum(1 for b in cat_b if b["is_in_favorites"])
        lines.append(f"\n  [{cat['nom']}]")
        lines.append(f"    Interactions: {len(cat_b)} | Clics: {clicked} | Favoris: {fav} | Pref: {pref}")

    lines.extend([
        f"\n\n{'=' * 60}",
        "  COLONNES DU DATASET PRINCIPAL (user_behavior.csv)",
        "=" * 60,
        "  interaction_id              - ID unique",
        "  user_id                     - ID utilisateur",
        "  product_id                  - ID produit",
        "  product_name                - Nom du produit",
        "  category_id/name            - Categorie sportive",
        "  product_type                - vetement/chaussure/accessoire/equipement",
        "  searched_size               - Taille recherchee par l'utilisateur",
        "  size_available              - La taille est disponible (True/False)",
        "  is_preferred_category       - Categorie preferee de l'utilisateur",
        "  search_frequency_in_category- Nb fois que l'user cherche cette categorie",
        "  is_in_favorites             - Produit dans les favoris",
        "  added_to_favorites          - Ajoute aux favoris pendant cette session",
        "  prix                        - Prix du produit",
        "  stock                       - Stock disponible",
        "  product_status              - EN_STOCK/RUPTURE/EN_ARRIVAGE",
        "  is_clicked                  - Click effectue (True/False)",
        "  click_duration_seconds      - Duree du clic",
        "  is_purchased                - Achat effectue (True/False)",
        "  recommendation_score        - SCORE DE RECOMMANDATION (0-100) = TARGET",
        "  interaction_time            - Date/heure",
    ])
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  dataset_summary.txt genere")


def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    print("Generation du Dataset Sponsor StreetLeague...")
    print("  Modele: Recommandation par categorie + taille + favoris")
    print("-" * 50)

    user_profiles = generate_user_profiles(150)
    sponsors = generate_sponsors_csv(output_dir)
    products = generate_products_csv(output_dir)
    behaviors = generate_user_behavior_csv(output_dir, user_profiles, products)
    profiles = generate_user_profiles_csv(output_dir, user_profiles)
    generate_summary(output_dir, sponsors, products, behaviors, profiles)

    print("-" * 50)
    print(f"Dataset genere: {len(behaviors)} interactions")


if __name__ == "__main__":
    main()
