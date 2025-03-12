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
    profile: "Profil"
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
    routes: {
      login: "/auth/login",
      register: "/auth/register",
      resetPassword: "/auth/reset-password",
      verifyEmail: "/auth/verify-email"
    },
    register: {
      title: "Créer un Compte",
      creatingAccount: "Création du Compte...",
      createButton: "Créer un Compte",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      passwordHelperText: "Le mot de passe doit contenir au moins 6 caractères",
      errors: {
        passwordMismatch: "Les mots de passe ne correspondent pas",
        passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
        emailRegistered: "Cet email est déjà enregistré. Veuillez essayer de vous connecter.",
        invalidEmail: "Veuillez entrer une adresse email valide.",
        invalidPassword: "Le mot de passe doit contenir au moins 6 caractères et inclure des lettres et des chiffres.",
        generic: "Échec de la création du compte. Veuillez réessayer."
      }
    },
    verifyEmail: {
      title: "Vérifiez Votre Email",
      description: "Nous vous avons envoyé un email avec un lien de vérification. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour vérifier votre adresse email.",
      spamNote: "Si vous ne voyez pas l'email, veuillez vérifier votre dossier spam.",
      verifying: "Vérification de votre email...",
      success: "Email Vérifié avec Succès !",
      redirecting: "Redirection vers la page d'accueil...",
      status: "Statut de Vérification",
      errors: {
        expired: "Le lien de vérification a expiré. Veuillez en demander un nouveau.",
        generic: "Veuillez essayer de vous connecter avec votre email et mot de passe"
      },
      goToLogin: "Aller à la Connexion"
    }
  },
  scan: {
    title: "Scanner des Ingrédients",
    takePhotoPrompt: "Cliquez ci-dessous pour prendre une photo",
    takePhoto: "Prendre une Photo",
    scannedIngredients: "Ingrédients Scannés",
    clearAll: "Tout Effacer",
    noIngredients: "Aucun ingrédient scanné",
    useCamera: "Utilisez la caméra pour scanner les ingrédients",
    saveIngredient: "Sauvegarder l'Ingrédient",
    ingredientAdded: "a été ajouté à vos ingrédients !",
    saveError: "Erreur lors de la sauvegarde de l'ingrédient",
    processingError: "Erreur lors du traitement de l'image",
    imageSizeError: "La taille de l'image est trop grande. Veuillez utiliser une image inférieure à 5MB.",
    noIngredientsDetected: "Aucun ingrédient détecté",
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
  },
  profile: {
    settings: "Paramètres du Profil",
    fullName: "Nom Complet",
    avatarUrl: "URL de l'Avatar",
    avatarHelp: "Entrez une URL pour votre photo de profil",
    email: "Email",
    updating: "Mise à jour...",
    updateProfile: "Mettre à Jour le Profil",
    updateSuccess: "Profil mis à jour avec succès !",
    updateError: "Échec de la mise à jour du profil. Veuillez réessayer."
  },
  shoppingList: {
    title: 'Liste de Courses',
    addItemTitle: 'Ajouter un Nouvel Article',
    itemName: 'Nom de l\'Article',
    amount: 'Quantité',
    unit: 'Unité',
    addToList: 'Ajouter à la Liste',
    addItem: 'Ajouter un Article',
    clearChecked: 'Effacer les Articles Cochés',
    empty: 'Votre liste de courses est vide',
    updateSuccess: 'Article mis à jour avec succès',
    updateError: 'Échec de la mise à jour de l\'article',
    deleteSuccess: 'Article supprimé avec succès',
    deleteError: 'Échec de la suppression de l\'article',
    addSuccess: 'Article ajouté avec succès',
    addError: 'Échec de l\'ajout de l\'article',
  },
  ingredients: {
    title: "Mes Ingrédients",
    subtitle: "Gérez les ingrédients de votre garde-manger et suivez ce que vous avez sous la main",
    addIngredients: "Ajouter des Ingrédients",
    scanIngredients: "Scanner des Ingrédients",
    emptyTitle: "Votre garde-manger est vide",
    emptyDescription: "Commencez par scanner des ingrédients pour les ajouter à votre liste",
    loadError: "Échec du chargement des ingrédients",
    deleteError: "Échec de la suppression de l'ingrédient",
    units: {
      piece: "pièce",
      pieces: "pièces",
      gram: "gramme",
      grams: "grammes",
      kilogram: "kilogramme",
      kilograms: "kilogrammes",
      milliliter: "millilitre",
      milliliters: "millilitres",
      liter: "litre",
      liters: "litres",
      tablespoon: "cuillère à soupe",
      tablespoons: "cuillères à soupe",
      teaspoon: "cuillère à café",
      teaspoons: "cuillères à café",
      cup: "tasse",
      cups: "tasses",
      pound: "livre",
      pounds: "livres",
      ounce: "once",
      ounces: "onces",
    },
  },
  footer: {
    copyright: "© 2024 Smart Cook. Tous droits réservés.",
    links: {
      about: "À propos",
      privacy: "Politique de Confidentialité",
      terms: "Conditions d'Utilisation",
      contact: "Contactez-nous"
    },
    description: "Smart Cook est votre assistant de cuisine alimenté par l'IA qui vous aide à découvrir des recettes, gérer vos ingrédients et cuisiner en toute confiance."
  },
} as const; 