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
    profile: "Profile"
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
    routes: {
      login: "/auth/login",
      register: "/auth/register",
      resetPassword: "/auth/reset-password",
      verifyEmail: "/auth/verify-email"
    },
    register: {
      title: "Create Account",
      creatingAccount: "Creating Account...",
      createButton: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      passwordHelperText: "Password must be at least 6 characters long",
      errors: {
        passwordMismatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 6 characters long",
        emailRegistered: "This email is already registered. Please try logging in instead.",
        invalidEmail: "Please enter a valid email address.",
        invalidPassword: "Password must be at least 6 characters long and contain both letters and numbers.",
        generic: "Failed to create an account. Please try again."
      }
    },
    verifyEmail: {
      title: "Check Your Email",
      description: "We've sent you an email with a verification link. Please check your inbox and click the link to verify your email address.",
      spamNote: "If you don't see the email, please check your spam folder.",
      verifying: "Verifying your email...",
      success: "Email Verified Successfully!",
      redirecting: "Redirecting you to the home page...",
      status: "Verification Status",
      errors: {
        expired: "Verification link has expired. Please request a new one.",
        generic: "Please try logging in with your email and password"
      },
      goToLogin: "Go to Login"
    }
  },
  scan: {
    title: "Scan Ingredients",
    takePhotoPrompt: "Click below to take a photo",
    takePhoto: "Take Photo",
    scannedIngredients: "Scanned Ingredients",
    clearAll: "Clear All",
    noIngredients: "No ingredients scanned",
    useCamera: "Use the camera to scan ingredients",
    saveIngredient: "Save Ingredient",
    ingredientAdded: "has been added to your ingredients!",
    saveError: "Failed to save ingredient",
    processingError: "Failed to process image",
    imageSizeError: "Image size is too large. Please use an image under 5MB.",
    noIngredientsDetected: "No ingredients detected",
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
  },
  profile: {
    settings: "Profile Settings",
    fullName: "Full Name",
    avatarUrl: "Avatar URL",
    avatarHelp: "Enter a URL for your profile picture",
    email: "Email",
    updating: "Updating...",
    updateProfile: "Update Profile",
    updateSuccess: "Profile updated successfully!",
    updateError: "Failed to update profile. Please try again."
  },
  shoppingList: {
    addItem: "Add Item",
    addItemTitle: "Add Item to Shopping List",
    clearChecked: "Clear Checked",
    empty: "Your shopping list is empty",
    itemName: "Item Name",
    amount: "Amount",
    unit: "Unit",
    addToList: "Add to List",
    addSuccess: "Item added to shopping list!",
    addError: "Failed to add item to shopping list",
    deleteSuccess: "Item removed from shopping list",
    deleteError: "Failed to remove item from shopping list",
    updateSuccess: "Shopping list updated",
    updateError: "Failed to update shopping list"
  },
  ingredients: {
    title: "My Ingredients",
    subtitle: "Manage your pantry ingredients and track what you have on hand",
    addIngredients: "Add Ingredients",
    scanIngredients: "Scan Ingredients",
    emptyTitle: "Your pantry is empty",
    emptyDescription: "Start by scanning ingredients to add them to your list",
    loadError: "Failed to load ingredients",
    deleteError: "Failed to delete ingredient",
    units: {
      piece: "piece",
      pieces: "pieces",
      gram: "gram",
      grams: "grams",
      kilogram: "kilogram",
      kilograms: "kilograms",
      milliliter: "milliliter",
      milliliters: "milliliters",
      liter: "liter",
      liters: "liters",
      tablespoon: "tablespoon",
      tablespoons: "tablespoons",
      teaspoon: "teaspoon",
      teaspoons: "teaspoons",
      cup: "cup",
      cups: "cups",
      pound: "pound",
      pounds: "pounds",
      ounce: "ounce",
      ounces: "ounces",
    },
  },
} as const; 