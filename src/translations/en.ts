export const en = {
  common: {
    welcome: "Welcome to Smart Cook",
    search: "Search",
    loading: "Loading...",
    error: "An error occurred",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    noResults: "No results found",
  },
  navigation: {
    home: "Home",
    recipes: "Recipes",
    favorites: "Favorites",
    settings: "Settings",
    scan: "Scan",
    shoppingList: "Shopping List",
    savedRecipes: "Saved Recipes",
  },
  recipe: {
    ingredients: "Ingredients",
    instructions: "Instructions",
    servings: "Servings",
    prepTime: "Preparation Time",
    cookTime: "Cooking Time",
    difficulty: "Difficulty",
    categories: "Categories",
    noMoreRecipes: "No more recipes to load",
    noRecipesFound: "No recipes found. Try different filters.",
    findRecipes: "Find Recipes",
  },
  cooking: {
    start: "Start Cooking",
    pause: "Pause",
    resume: "Resume",
    finish: "Finish",
    timer: "Timer",
    nextStep: "Next Step",
    previousStep: "Previous Step",
  },
  home: {
    subtitle: "Your AI-powered cooking companion that helps you discover recipes, manage ingredients, and cook with confidence.",
    features: {
      search: {
        title: "Smart Recipe Search",
        description: "Find recipes that match your preferences, dietary restrictions, and available ingredients.",
        button: "Find Recipes"
      },
      scanner: {
        title: "Ingredient Scanner",
        description: "Use your camera to scan ingredients and get instant recipe suggestions.",
        button: "Scan Now"
      },
      management: {
        title: "Ingredient Management",
        description: "Keep track of your pantry and get notified when items are running low.",
        button: "Manage Ingredients"
      },
      shopping: {
        title: "Shopping List",
        description: "Automatically generate shopping lists from recipes and manage your grocery needs.",
        button: "View List"
      },
      collection: {
        title: "Recipe Collection",
        description: "Save your favorite recipes and organize them for quick access.",
        button: "My Recipes"
      },
      assistant: {
        title: "Cooking Assistant",
        description: "Get step-by-step guidance and smart timers while cooking your meals.",
        button: "Start Cooking"
      }
    }
  },
  auth: {
    signInPrompt: "Sign in to Access Cooking Assistant",
    signInDescription: "Please sign in to use the cooking assistant and camera features.",
    signingIn: "Signing in...",
    signInButton: "Sign In",
    signUpLink: "Sign up",
    resetPassword: "Reset password",
  },
  scan: {
    noIngredients: "No ingredients scanned",
    useCamera: "Use the camera to scan ingredients",
  },
  search: {
    searchRecipes: "Search Recipes",
    cuisine: "Cuisine",
    diet: "Diet",
    filters: "Filters",
    filterRecipes: "Filter Recipes",
    cookingTime: "Cooking Time (minutes)",
    complexity: "Complexity",
    mealType: "Meal Type",
    dietaryPreferences: "Dietary Preferences",
    noMoreRecipes: "No more recipes to load",
    noRecipesFound: "No recipes found. Try different search terms or filters.",
    enterSearchTerm: "Enter a search term to find recipes",
    minutes: "min",
    hours: {
      one: "h",
      plus: "h+"
    },
    mealTypes: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      dessert: "Dessert",
      snack: "Snack",
      appetizer: "Appetizer"
    },
    dietaryOptions: {
      vegetarian: "Vegetarian",
      vegan: "Vegan",
      glutenFree: "Gluten-Free",
      dairyFree: "Dairy-Free",
      lowCarb: "Low-Carb",
      keto: "Keto"
    },
    complexityLevels: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard"
    }
  }
} as const; 