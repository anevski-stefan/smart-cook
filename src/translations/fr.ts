export const fr = {
  common: {
    welcome: "Bienvenue sur Smart Cook",
    search: "Rechercher",
    loading: "Chargement...",
    error: "Une erreur est survenue",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    signIn: "Se Connecter",
    signOut: "Se Déconnecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    noAccount: "Vous n'avez pas de compte ?",
    noResults: "Aucun résultat trouvé",
  },
  navigation: {
    home: "Accueil",
    recipes: "Recettes",
    favorites: "Favoris",
    settings: "Paramètres",
    scan: "Scanner",
    shoppingList: "Liste de Courses",
    savedRecipes: "Recettes Sauvegardées",
  },
  recipe: {
    ingredients: "Ingrédients",
    instructions: "Instructions",
    servings: "Portions",
    prepTime: "Temps de Préparation",
    cookTime: "Temps de Cuisson",
    difficulty: "Difficulté",
    categories: "Catégories",
    noMoreRecipes: "Plus de recettes à charger",
    noRecipesFound: "Aucune recette trouvée. Essayez d'autres filtres.",
    findRecipes: "Trouver des Recettes",
  },
  cooking: {
    start: "Commencer la Cuisine",
    pause: "Pause",
    resume: "Reprendre",
    finish: "Terminer",
    timer: "Minuteur",
    nextStep: "Étape Suivante",
    previousStep: "Étape Précédente",
  },
  home: {
    subtitle: "Votre assistant de cuisine alimenté par l'IA qui vous aide à découvrir des recettes, gérer les ingrédients et cuisiner en toute confiance.",
    features: {
      search: {
        title: "Recherche Intelligente de Recettes",
        description: "Trouvez des recettes qui correspondent à vos préférences, restrictions alimentaires et ingrédients disponibles.",
        button: "Trouver des Recettes"
      },
      scanner: {
        title: "Scanner d'Ingrédients",
        description: "Utilisez votre caméra pour scanner les ingrédients et obtenir des suggestions de recettes instantanées.",
        button: "Scanner Maintenant"
      },
      management: {
        title: "Gestion des Ingrédients",
        description: "Suivez votre garde-manger et recevez des notifications lorsque les articles sont presque épuisés.",
        button: "Gérer les Ingrédients"
      },
      shopping: {
        title: "Liste de Courses",
        description: "Générez automatiquement des listes de courses à partir des recettes et gérez vos besoins en courses.",
        button: "Voir la Liste"
      },
      collection: {
        title: "Collection de Recettes",
        description: "Sauvegardez vos recettes préférées et organisez-les pour un accès rapide.",
        button: "Mes Recettes"
      },
      assistant: {
        title: "Assistant de Cuisine",
        description: "Obtenez des instructions étape par étape et des minuteurs intelligents pendant que vous cuisinez.",
        button: "Commencer à Cuisiner"
      }
    }
  },
  auth: {
    signInPrompt: "Connectez-vous pour accéder à l'Assistant de Cuisine",
    signInDescription: "Veuillez vous connecter pour utiliser l'assistant de cuisine et les fonctionnalités de la caméra.",
    signingIn: "Connexion en cours...",
    signInButton: "Se Connecter",
    signUpLink: "S'inscrire",
    resetPassword: "Réinitialiser le mot de passe",
  },
  scan: {
    noIngredients: "Aucun ingrédient scanné",
    useCamera: "Utilisez la caméra pour scanner les ingrédients",
  },
  search: {
    searchRecipes: "Rechercher des Recettes",
    cuisine: "Cuisine",
    diet: "Régime",
    filters: "Filtres",
    filterRecipes: "Filtrer les Recettes",
    cookingTime: "Temps de Cuisson (minutes)",
    complexity: "Difficulté",
    mealType: "Type de Repas",
    dietaryPreferences: "Préférences Alimentaires",
    noMoreRecipes: "Plus de recettes à charger",
    noRecipesFound: "Aucune recette trouvée. Essayez d'autres termes de recherche ou filtres.",
    enterSearchTerm: "Entrez un terme de recherche pour trouver des recettes",
    minutes: "min",
    hours: {
      one: "h",
      plus: "h+"
    },
    mealTypes: {
      breakfast: "Petit-déjeuner",
      lunch: "Déjeuner",
      dinner: "Dîner",
      dessert: "Dessert",
      snack: "Collation",
      appetizer: "Entrée"
    },
    dietaryOptions: {
      vegetarian: "Végétarien",
      vegan: "Végétalien",
      glutenFree: "Sans Gluten",
      dairyFree: "Sans Produits Laitiers",
      lowCarb: "Faible en Glucides",
      keto: "Keto"
    },
    complexityLevels: {
      easy: "Facile",
      medium: "Moyen",
      hard: "Difficile"
    }
  }
} as const; 