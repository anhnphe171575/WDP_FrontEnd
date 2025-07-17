const pagesConfig = {
    homepage: {
      banner: {
        title: "Welcome to PetNest1!",
        description: "The shopping place for your pet.",
      },
      shopByPet: {
        title: "Shop by Pet",
        description: "Choose the right products for each type of your pet.",
      },
      popularCategories: {
        title: "Popular Categories",
        description: "Discover quality products for your pet.",
      },
      bestSelling: {
        title: "Best Selling Products",
        description: "Explore our most popular products, loved by thousands of satisfied customers.",
        linkText: "View All",
      },
      whyShop: {
        title: "Why Choose PetNest?",
        description: "We are committed to providing the best shopping experience for you and your pet.",
      },
      newsletter: {
        title: "Subscribe to Our Newsletter",
        description: "Get updates on new products and special promotions.",
        placeholder: "Your email",
        button: "Subscribe",
      }
    },
    blog: {
      searchPlaceholder: "Search for articles...",
      backToHome: "Back to homepage",
      readMore: "Read more"
    },
    blogdetail: {
      loading: "Loading article...",
      error: {
        title: "Oops! An error occurred",
        notFound: "Article not found"
      },
      backToBlog: "Back to Blog",
      suggestedReading: "Related Articles"
    },
    bannerManagement: {
      title: "Banner Management",
      addNewButton: "Add New Banner",
      search: {
        placeholder: "Search banners...",
        statusPlaceholder: "Status"
      },
      table: {
        headers: {
          no: "No.",
          title: "Title",
          description: "Description",
          status: "Status",
          startDate: "Start Date",
          actions: "Actions"
        }
      },
      form: {
        addTitle: "Add New Banner",
        editTitle: "Edit Banner",
        fields: {
          title: "Title",
          description: "Description",
          image: "Banner Image",
          status: "Status",
          startDate: "Start Date",
          endDate: "End Date",
          link: "Link"
        },
        buttons: {
          cancel: "Cancel",
          save: "Save Changes",
          add: "Add Banner"
        }
      },
      detail: {
        title: "Banner Details",
        closeButton: "Close"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      },
      loading: "Loading...",
      uploadingProgress: "Uploading: "
    },
    blogManagement: {
      title: "Blog Management",
      addNewButton: "Add New Blog",
      search: {
        placeholder: "Search blogs..."
      },
      table: {
        headers: {
          no: "No.",
          title: "Title",
          description: "Description",
          tag: "Tag",
          createdAt: "Created At",
          actions: "Actions"
        }
      },
      form: {
        addTitle: "Add New Blog",
        editTitle: "Edit Blog",
        fields: {
          title: "Title",
          description: "Description",
          tag: "Tag",
          images: "Blog Images"
        },
        buttons: {
          cancel: "Cancel",
          save: "Save Changes",
          add: "Add Blog"
        },
        uploading: "Uploading"
      },
      detail: {
        title: "Blog Details",
        fields: {
          title: "Title",
          description: "Description",
          tag: "Tag",
          createdAt: "Created At",
          images: "Images"
        },
        closeButton: "Close"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      }
    },
    reviewManagement: {
      title: "Review Management",
      search: {
        placeholder: "Search products...",
        ratingPlaceholder: "Filter by rating"
      },
      table: {
        headers: {
          productName: "Product Name",
          averageRating: "Average Rating",
          totalComments: "Total Comments"
        }
      },
      commentsDialog: {
        title: "Comments for",
        ratingFilter: {
          all: "All Ratings",
          five: "5 Stars",
          four: "4 Stars",
          three: "3 Stars",
          two: "2 Stars",
          one: "1 Star"
        }
      },
      pagination: {
        showing: "Showing {start} to {end} of {total} products",
        previous: "Previous",
        next: "Next"
      }
    },
    userManagement: {
      title: "User Management",
      addNewButton: "Add New User",
      editTitle: "Edit User",
      search: {
        placeholder: "Search users...",
        rolePlaceholder: "Filter by role"
      },
      table: {
        headers: {
          no: "No.",
          name: "Name",
          email: "Email",
          role: "Role",
          active: "Active",
          status: "Status",
          actions: "Actions"
        }
      },
      form: {
        addTitle: "Add New User",
        editTitle: "Edit User",
        fields: {
          name: "Name",
          email: "Email",
          password: "Password",
          phone: "Phone",
          dob: "Date of Birth",
          role: "Role",
          address: "Address",
          street: "Street",
          city: "City",
          state: "State",
          postalCode: "Postal Code",
          country: "Country"
        },
        addAddress: "Add Another Address",
        buttons: {
          cancel: "Cancel",
          save: "Save Changes",
          add: "Add User"
        }
      },
      status: {
        active: "Active",
        inactive: "Inactive",
        verified: "Verified",
        unverified: "Unverified"
      },
      detail: {
        title: "User Details",
        phone: "Phone",
        dob: "Date of Birth",
        role: "Role",
        status: "Status",
        addresses: "Addresses",
        accountInfo: "Account Information",
        createdAt: "Created At",
        updatedAt: "Last Updated"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      },
      loading: "Loading...",
      error: "Error:"
    },
    changepass: {
      title: "Change Password",
      description: "Enter your current and new password to update your account",
      fields: {
        currentPassword: {
          label: "Current Password",
          placeholder: "Enter current password"
        },
        newPassword: {
          label: "New Password",
          placeholder: "Enter new password"
        },
        confirmPassword: {
          label: "Confirm New Password",
          placeholder: "Re-enter new password"
        }
      },
      button: {
        submit: "Change Password",
        loading: "Processing..."
      },
      success: "Password changed successfully!",
      errors: {
        requiredCurrent: "Please enter your current password",
        requiredNew: "Please enter your new password",
        minLength: "Password must be at least 8 characters",
        pattern: "Password must contain uppercase, lowercase letters and a number",
        requiredConfirm: "Please confirm your new password",
        notMatch: "Confirmation password does not match",
        changeError: "An error occurred while changing the password",
        wrongCurrent: "Current password is incorrect",
        tokenInvalid: "Token is invalid or expired. Please log in again.",
        tryAgain: "An error occurred while changing the password. Please try again."
      }
    },
    userProfilePage: {
      notFoundToken: "Token not found",
      notUpdatedAddress: "Address not updated",
      fetchError: "Unable to load profile information. Please try again later.",
      retry: "Retry",
      memberSince: "Member since {joinDate}",
      changePassword: "Change Password",
      cancel: "Cancel",
      edit: "Edit",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      address: "Address",
      joinDate: "Join Date",
      save: "Save Changes"
    },
    header: {
      brand: {
        short: "P",
        full: "Pet Nest"
      },
      search: {
        placeholder: "Search for products, brands, and more...",
        mobilePlaceholder: "Search for products..."
      },
      cart: {
        title: "Cart ({count} items)",
        empty: "Your cart is empty",
        viewCart: "View cart"
      },
      notifications: {
        title: "Notifications",
        viewAll: "View all notifications"
      },
      user: {
        login: "Login",
        signup: "Sign Up",
        myProfile: "My Profile",
        myOrders: "My Orders",
        wishlist: "Wishlist",
        settings: "Settings",
        requestSupport: "Request Support",
        logout: "Logout"
      },
      language: {
        vi: "VI",
        en: "EN"
      }
    },
    cart: {
      continueShopping: "Continue shopping",
      emptyTitle: "Cart is empty",
      emptyDesc: "You have no items in your cart",
      startShopping: "Start shopping",
      title: "Shopping Cart",
      productCount: "{count} items",
      selectAll: "Select all ({selected}/{total})",
      selectedTotal: "Selected total",
      selected: "✓ Selected",
      pricePerProduct: "{price} / item",
      selectedCount: "{count} items selected",
      addToFavorite: "Add to favorites",
      buyNow: "Buy now ({count})",
      error: "Error"
    },
    categoryPage: {
      breadcrumb: {
        home: "Home",
        products: "Products"
      },
      sidebar: {
        category: "Category",
        price: "Price",
        brand: "Brand",
        findBrandPlaceholder: "Find a brand",
        showLess: "Show less",
        showMore: "+ {count} more",
        customerRating: "Customer Rating"
      },
      sort: {
        results: "{count} Results",
        sortBy: "Sort By",
        relevance: "Relevance",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
        rating: "Customer Rating",
        newest: "Newest",
        bestselling: "Best Selling"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      },
      product: {
        price: "${price}",
        addToWishlist: "Add to wishlist"
      }
    },
    productDetail: {
      uncategorized: "Uncategorized",
      quantity: "Quantity",
      addToCart: "Add to Cart",
      adding: "Adding...",
      outOfStock: "Out of stock",
      left: "Left:",
      freeShipping: "Free Shipping",
      warranty: "2 Year Warranty",
      returns: "30 Day Returns",
      customerReviews: "Customer Reviews",
      ratingOverview: "Rating Overview",
      basedOnReviews: "Based on {n} reviews",
      verifiedPurchase: "Verified Purchase",
      reviewImageAlt: "Review image",
      userFallback: "User",
      avatarFallback: "U",
      productNotFound: "Product not found",
      addToCartSuccess: "Product added to cart successfully!",
      addToCartFail: "Failed to add product to cart",
      quantityGreaterThanZero: "Quantity must be greater than 0",
      selectedVariantNotFound: "Selected variant not found",
      loading: "Loading...",
      errorFetching: "Error fetching product:",
      addToWishlist: "Add to wishlist",
      cancel: "Cancel",
      reviewForm: {
        title: "Write a Review",
        subtitle: "Share your experience with this product",
        rating: "Rating",
        titleField: "Review Title",
        titlePlaceholder: "Summarize your experience",
        comment: "Review",
        commentPlaceholder: "Tell us about your experience with this product...",
        images: "Images (optional)",
        submit: "Submit Review",
        submitting: "Submitting...",
        success: "Review submitted successfully!",
        error: "Failed to submit review. Please try again.",
        required: "This field is required",
        minRating: "Please select a rating",
        minCommentLength: "Review must be at least 10 characters long"
      },
      unreviewedSection: {
        title: "You purchased this product",
        subtitle: "Share your experience to help other customers",
        writeReview: "Write a Review",
        purchasedOn: "Purchased on {date}"
      }
    },
    bestSellingPage: {
      breadcrumb: {
        home: "Home",
        products: "Products"
      },
      sidebar: {
        category: "Category",
        price: "Price",
        min: "Min",
        max: "Max",
        brand: "Brand",
        findBrandPlaceholder: "Find a brand",
        showLess: "Show less",
        showMore: "+ {count} more",
        customerRating: "Customer Rating"
      },
      sort: {
        results: "{count} Results",
        sortBy: "Sort By",
        relevance: "Relevance",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
        rating: "Customer Rating",
        newest: "Newest",
        bestselling: "Best Selling"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      },
      product: {
        price: "{price} ₫",
        addToWishlist: "Add to wishlist"
      },
      loading: "Loading...",
      error: {
        fetch: "Failed to fetch best-selling products",
        general: "An error occurred while fetching data"
      },
      searchPlaceholder: "Search by name or category..."
    },
    searchPage: {
      breadcrumb: {
        home: "Home",
        products: "Products"
      },
      sidebar: {
        category: "Category",
        all: "All",
        price: "Price",
        min: "Min",
        max: "Max",
        brand: "Brand",
        findBrandPlaceholder: "Find a brand",
        showLess: "Show less",
        showMore: "+ {count} more",
        customerRating: "Customer Rating"
      },
      sort: {
        results: "{count} Results",
        sortBy: "Sort By",
        relevance: "Relevance",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
        rating: "Customer Rating",
        newest: "Newest",
        bestselling: "Best Selling"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      },
      product: {
        price: "{price}₫",
        addToWishlist: "Add to wishlist"
      }
    },
    statistics: {
      pageTitle: "Revenue & Profit Statistics",
      pageDescription: "Analyze product performance and revenue",
      filter: {
        title: "Filters",
        fromDate: "From date",
        toDate: "To date",
        sortBy: "Sort by",
        limit: "Display limit",
        top5: "Top 5",
        top10: "Top 10",
        top20: "Top 20",
        top50: "Top 50"
      },
      summary: {
        totalRevenue: "Total Revenue",
        totalProfit: "Total Profit",
        totalQuantity: "Total Quantity"
      },
      tabs: {
        bestSelling: "Best Selling Products",
        slowSelling: "Slow Selling Products",
        revenueOverTime: "Revenue Over Time"
      },
      bestSelling: {
        title: "Top Revenue Products",
        description: "List of products with highest revenue and profit"
      },
      slowSelling: {
        title: "Slow Selling Products",
        description: "List of products with lowest revenue"
      },
      revenueOverTime: {
        title: "Revenue Over Time",
        description: "Revenue chart over time",
        timePeriod: "Time period",
        byDay: "By day",
        byWeek: "By week",
        byMonth: "By month"
      },
      loading: "Loading data...",
      table: {
        product: "Product",
        quantity: "Quantity Sold",
        revenue: "Revenue",
        cost: "Cost",
        profit: "Profit",
        profitMargin: "Profit Margin",
        orderCount: "Order Count"
      }
    },
    userstatistics: {
      pageTitle: "User Management Dashboard",
      filter: "Filter",
      export: "Export report",
      totalUsers: "Total customers",
      currentMonthUsers: "Customers this month",
      potentialCustomers: "Potential customers",
      loyalCustomers: "Loyal customers",
      registrationStats: {
        title: "User Registration Statistics",
        description: "Track the number of user registrations over time",
        monthly: "Monthly",
        yearly: "Yearly"
      },
      tabs: {
        potential: "Potential Customers",
        topBuyers: "Top Buyers",
        cancellation: "Cancellation Analysis"
      },
      searchPlaceholder: "Search customers...",
      table: {
        customer: "Customer",
        email: "Email",
        phone: "Phone",
        createdAt: "Account Created",
        ranking: "Ranking",
        orders: "Orders",
        totalSpent: "Total Spent",
        avgOrder: "Avg/Order",
        totalOrders: "Total Orders",
        cancelledOrders: "Cancelled Orders",
        cancelRate: "Cancel Rate",
        mainReason: "Main Reason"
      },
      pagination: {
        show: "Show",
        of: "of",
        results: "results",
        page: "Page",
        previous: "Previous",
        next: "Next"
      },
      details: {
        cancellationTitle: "Customer Cancellation Details",
        cancellationDesc: "Detailed information about customers with high cancellation rates"
      }
    },
    voucherManagement: {
      title: "Voucher Management",
      addNewButton: "Add New Voucher",
      form: {
        addTitle: "Add New Voucher",
        editTitle: "Edit Voucher",
        fields: {
          code: "Voucher Code",
          discountAmount: "Discount Amount",
          discountPercent: "Discount Percent",
          validFrom: "Start Time",
          validTo: "End Time",
          usageLimit: "Usage Limit"
        },
        buttons: {
          cancel: "Cancel",
          add: "Create Voucher",
          save: "Update Voucher"
        }
      },
      search: {
        placeholder: "Search voucher..."
      },
      table: {
        headers: {
          no: "No.",
          code: "Voucher Code",
          discount: "Discount",
          validTime: "Validity Period",
          usage: "Usage",
          actions: "Actions"
        },
        validFrom: "From:",
        validTo: "To:",
        edit: "Edit",
        delete: "Delete"
      },
      error: {
        fetch: "Error loading voucher list",
        duplicateCode: "Voucher code already exists",
        invalidStartDate: "Start time must be today or later",
        create: "Error creating voucher",
        discountType: "Only one type of discount can be entered",
        update: "Error updating voucher",
        delete: "Error deleting voucher"
      },
      success: {
        create: "Voucher created successfully",
        update: "Voucher updated successfully",
        delete: "Voucher deleted successfully"
      },
      confirm: {
        delete: "Are you sure you want to delete this voucher?"
      },
      pagination: {
        previous: "Previous",
        next: "Next"
      }
    },
    suportRequest: {
      pageTitle: "Support Request List",
      search: {
        placeholder: "Search by title, description...",
        statusPlaceholder: "Status",
        all: "All"
      },
      table: {
        headers: {
          no: "No.",
          title: "Title",
          description: "Description",
          createdAt: "Created Date",
          status: "Status",
          actions: "Actions"
        },
        noData: "No matching requests found."
      },
      status: {
        new: "New",
        processing: "Processing",
        resolved: "Resolved",
        rejected: "Rejected"
      },
      priority: {
        urgent: "Urgent",
        high: "High",
        normal: "Normal"
      },
      detail: {
        title: "Support Request Detail",
        fields: {
          title: "Title",
          noTitle: "(None)",
          content: "Content",
          status: "Status",
          priority: "Priority",
          handler: "Handler",
          noHandler: "(None)",
          createdAt: "Created At",
          updatedAt: "Updated At",
          response: "Response",
          internalNote: "Internal Note"
        },
        buttons: {
          save: "Save",
          cancel: "Cancel",
          close: "Close"
        },
        updateStatus: "Update status"
      },
      actions: {
        viewDetail: "View detail"
      },
      loading: "Loading data...",
      pagination: {
        previous: "Previous",
        next: "Next"
      }
    }
  };
  
  export default pagesConfig;
  