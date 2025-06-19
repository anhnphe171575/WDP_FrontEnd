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
    }
  };
  
  export default pagesConfig;
  