const pagesConfig = {
    homepage:{
  banner: {
    title: "Chào mừng đến với PetNest1!",
    description: "Nơi mua sắm cho thú cưng của bạn.",
  },
  shopByPet: {
    title: "Mua sắm theo thú cưng",
    description: "Lựa chọn sản phẩm phù hợp cho từng loại thú cưng của bạn",
  },
  popularCategories: {
    title: "Danh mục phổ biến",
    description: "Khám phá các sản phẩm chất lượng cho thú cưng của bạn",
  },
  bestSelling: {
    title: "Sản phẩm bán chạy nhất",
    description: "Khám phá những sản phẩm được yêu thích nhất của chúng tôi, được lựa chọn bởi hàng nghìn khách hàng hài lòng.",
    linkText: "Xem tất cả",
  },
  whyShop: {
    title: "Tại sao chọn PetNest?",
    description: "Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho bạn và thú cưng của bạn",
  },
  newsletter: {
    title: "Đăng ký nhận thông báo",
    description: "Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt",
    placeholder: "Email của bạn",
    button: "Đăng ký",
  },
  
},
blog: {
  searchPlaceholder: "Tìm kiếm bài viết...",
  backToHome: "Quay về trang chủ",
  readMore: "Đọc thêm",

},
blogdetail: {
  loading: "Đang tải bài viết...",
  error: {
    title: "Rất tiếc! Đã xảy ra lỗi",
    notFound: "Không tìm thấy bài viết"
  },
  backToBlog: "Quay về Blog",
  suggestedReading: "Bài viết liên quan"
},
bannerManagement: {
  title: "Quản lý Banner",
  addNewButton: "Thêm Banner Mới",
  search: {
    placeholder: "Tìm kiếm banner...",
    statusPlaceholder: "Trạng thái"
  },
  table: {
    headers: {
      no: "STT",
      title: "Tiêu đề",
      description: "Mô tả",
      status: "Trạng thái",
      startDate: "Ngày bắt đầu",
      actions: "Thao tác"
    }
  },
  form: {
    addTitle: "Thêm Banner Mới",
    editTitle: "Chỉnh sửa Banner",
    fields: {
      title: "Tiêu đề",
      description: "Mô tả",
      image: "Hình ảnh Banner",
      status: "Trạng thái",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
      link: "Liên kết"
    },
    buttons: {
      cancel: "Hủy",
      save: "Lưu thay đổi",
      add: "Thêm Banner"
    }
  },
  detail: {
    title: "Chi tiết Banner",
    closeButton: "Đóng"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  },
  loading: "Đang tải...",
  uploadingProgress: "Đang tải lên: "
},
blogManagement: {
  title: "Quản lý Blog",
  addNewButton: "Thêm Blog Mới",
  search: {
    placeholder: "Tìm kiếm blog..."
  },
  table: {
    headers: {
      no: "STT",
      title: "Tiêu đề",
      description: "Mô tả",
      tag: "Thẻ",
      createdAt: "Ngày tạo",
      actions: "Thao tác"
    }
  },
  form: {
    addTitle: "Thêm Blog Mới",
    editTitle: "Chỉnh sửa Blog",
    fields: {
      title: "Tiêu đề",
      description: "Mô tả",
      tag: "Thẻ",
      images: "Hình ảnh Blog"
    },
    buttons: {
      cancel: "Hủy",
      save: "Lưu thay đổi",
      add: "Thêm Blog"
    },
    uploading: "Đang tải lên"
  },
  detail: {
    title: "Chi tiết Blog",
    fields: {
      title: "Tiêu đề",
      description: "Mô tả",
      tag: "Thẻ",
      createdAt: "Ngày tạo",
      images: "Hình ảnh"
    },
    closeButton: "Đóng"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  }
},
reviewManagement: {
  title: "Quản lý Đánh giá",
  search: {
    placeholder: "Tìm kiếm sản phẩm...",
    ratingPlaceholder: "Lọc theo đánh giá"
  },
  table: {
    headers: {
      productName: "Tên sản phẩm",
      averageRating: "Đánh giá trung bình",
      totalComments: "Tổng bình luận"
    }
  },
  commentsDialog: {
    title: "Bình luận cho",
    ratingFilter: {
      all: "Tất cả đánh giá",
      five: "5 Sao",
      four: "4 Sao",
      three: "3 Sao",
      two: "2 Sao",
      one: "1 Sao"
    }
  },
  pagination: {
    showing: "Hiển thị {start} đến {end} trong tổng số {total} sản phẩm",
    previous: "Trước",
    next: "Tiếp"
  }
},
userManagement: {
  title: "Quản lý Người dùng",
  addNewButton: "Thêm Người dùng Mới",
  editTitle: "Chỉnh sửa Người dùng",
  search: {
    placeholder: "Tìm kiếm người dùng...",
    rolePlaceholder: "Lọc theo vai trò"
  },
  table: {
    headers: {
      no: "STT",
      name: "Họ và Tên",
      email: "Email",
      role: "Vai trò",
      active: "Hoạt động",
      status: "Trạng thái",
      actions: "Thao tác"
    }
  },
  form: {
    addTitle: "Thêm Người dùng Mới",
    editTitle: "Chỉnh sửa Người dùng",
    fields: {
      name: "Họ và Tên",
      email: "Email",
      password: "Mật khẩu",
      phone: "Số điện thoại",
      dob: "Ngày sinh",
      role: "Vai trò",
      address: "Địa chỉ",
      street: "Đường",
      city: "Thành phố",
      state: "Tỉnh/Bang",
      postalCode: "Mã bưu chính",
      country: "Quốc gia"
    },
    addAddress: "Thêm Địa chỉ Khác",
    buttons: {
      cancel: "Hủy",
      save: "Lưu Thay đổi",
      add: "Thêm Người dùng"
    }
  },
  status: {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    verified: "Đã xác minh",
    unverified: "Chưa xác minh"
  },
  detail: {
    title: "Chi tiết Người dùng",
    phone: "Số điện thoại",
    dob: "Ngày sinh",
    role: "Vai trò",
    status: "Trạng thái",
    addresses: "Địa chỉ",
    accountInfo: "Thông tin Tài khoản",
    createdAt: "Ngày tạo",
    updatedAt: "Cập nhật lần cuối"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  },
  loading: "Đang tải...",
  error: "Lỗi:"
},
changepass: {
  title: "Đổi Mật Khẩu",
  description: "Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản của bạn",
  fields: {
    currentPassword: {
      label: "Mật khẩu hiện tại",
      placeholder: "Nhập mật khẩu hiện tại"
    },
    newPassword: {
      label: "Mật khẩu mới",
      placeholder: "Nhập mật khẩu mới"
    },
    confirmPassword: {
      label: "Xác nhận mật khẩu mới",
      placeholder: "Nhập lại mật khẩu mới"
    }
  },
  button: {
    submit: "Đổi Mật Khẩu",
    loading: "Đang xử lý..."
  },
  success: "Đổi mật khẩu thành công!",
  errors: {
    requiredCurrent: "Vui lòng nhập mật khẩu hiện tại",
    requiredNew: "Vui lòng nhập mật khẩu mới",
    minLength: "Mật khẩu phải có ít nhất 8 ký tự",
    pattern: "Mật khẩu phải chứa chữ hoa, chữ thường và số",
    requiredConfirm: "Vui lòng xác nhận mật khẩu mới",
    notMatch: "Mật khẩu xác nhận không khớp",
    changeError: "Có lỗi xảy ra khi đổi mật khẩu",
    wrongCurrent: "Mật khẩu hiện tại không đúng",
    tokenInvalid: "Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.",
    tryAgain: "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại."
  }
},
userProfilePage: {
  notFoundToken: "Không tìm thấy token",
  notUpdatedAddress: "Chưa cập nhật địa chỉ",
  fetchError: "Không thể tải thông tin profile. Vui lòng thử lại sau.",
  retry: "Thử lại",
  memberSince: "Thành viên từ {joinDate}",
  changePassword: "Thay đổi mật khẩu",
  cancel: "Hủy",
  edit: "Chỉnh sửa",
  name: "Họ và tên",
  email: "Email",
  phone: "Số điện thoại",
  address: "Địa chỉ",
  joinDate: "Ngày tham gia",
  save: "Lưu thay đổi"
},
header: {
  brand: {
    short: "P",
    full: "Pet Nest"
  },
  search: {
    placeholder: "Tìm kiếm sản phẩm, thương hiệu và nhiều hơn nữa...",
    mobilePlaceholder: "Tìm kiếm sản phẩm..."
  },
  cart: {
    title: "Sản phẩm mới nhất",
    empty: "Giỏ hàng của bạn đang trống",
    viewCart: "Xem giỏ hàng"
  },
  notifications: {
    title: "Thông báo",
    viewAll: "Xem tất cả thông báo"
  },
  user: {
    login: "Đăng nhập",
    signup: "Đăng ký",
    myProfile: "Trang cá nhân",
    myOrders: "Đơn hàng của tôi",
    wishlist: "Yêu thích",
    settings: "Cài đặt",
    requestSupport: "Yêu cầu hỗ trợ",
    logout: "Đăng xuất"
  },
  language: {
    vi: "VI",
    en: "EN"
  }
},
cart: {
  continueShopping: "Tiếp tục mua sắm",
  emptyTitle: "Giỏ hàng trống",
  emptyDesc: "Bạn chưa có sản phẩm nào trong giỏ hàng",
  startShopping: "Bắt đầu mua sắm",
  title: "Giỏ hàng",
  productCount: "{count} sản phẩm",
  selectAll: "Chọn tất cả ({selected}/{total})",
  selectedTotal: "Tổng tiền đã chọn",
  selected: "✓ Đã chọn",
  pricePerProduct: "{price} / sản phẩm",
  selectedCount: "Đã chọn {count} sản phẩm",
  addToFavorite: "Thêm vào yêu thích",
  buyNow: "Mua ngay ({count})",
  error: "Lỗi"
},
categoryPage: {
  breadcrumb: {
    home: "Trang chủ",
    products: "Sản phẩm"
  },
  sidebar: {
    category: "Danh mục",
    price: "Giá",
    brand: "Thương hiệu",
    findBrandPlaceholder: "Tìm thương hiệu",
    showLess: "Ẩn bớt",
    showMore: "+ {count} thêm",
    customerRating: "Đánh giá khách hàng"
  },
  sort: {
    results: "{count} kết quả",
    sortBy: "Sắp xếp theo",
    relevance: "Liên quan",
    priceLow: "Giá: Thấp đến Cao",
    priceHigh: "Giá: Cao đến Thấp",
    rating: "Đánh giá khách hàng",
    newest: "Mới nhất",
    bestselling: "Bán chạy nhất"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  },
  product: {
    price: "{price}₫",
    addToWishlist: "Thêm vào yêu thích"
  }
},

productDetail: {
  uncategorized: "Chưa phân loại",
  quantity: "Số lượng",
  addToCart: "Thêm vào giỏ hàng",
  adding: "Đang thêm...",
  outOfStock: "Sản phẩm hết hàng",
  left: "Còn lại:",
  freeShipping: "Miễn phí vận chuyển",
  warranty: "Bảo hành 2 năm",
  returns: "Đổi trả trong 30 ngày",
  customerReviews: "Đánh giá của khách hàng",
  ratingOverview: "Tổng quan đánh giá",
  basedOnReviews: "Dựa trên {n} đánh giá",
  verifiedPurchase: "Đã mua hàng",
  reviewImageAlt: "Ảnh đánh giá",
  userFallback: "Người dùng",
  avatarFallback: "U",
  productNotFound: "Không tìm thấy sản phẩm",
  addToCartSuccess: "Thêm sản phẩm vào giỏ hàng thành công!",
  addToCartFail: "Thêm sản phẩm vào giỏ hàng thất bại",
  quantityGreaterThanZero: "Số lượng phải lớn hơn 0",
  selectedVariantNotFound: "Không tìm thấy biến thể đã chọn",
  loading: "Đang tải...",
  errorFetching: "Lỗi khi tải sản phẩm:",
  addToWishlist: "Thêm vào yêu thích",
  cancel: "Hủy",
  reviewForm: {
    title: "Viết đánh giá",
    subtitle: "Chia sẻ trải nghiệm của bạn với sản phẩm này",
    rating: "Đánh giá",
    titleField: "Tiêu đề đánh giá",
    titlePlaceholder: "Tóm tắt trải nghiệm của bạn",
    comment: "Đánh giá",
    commentPlaceholder: "Hãy cho chúng tôi biết về trải nghiệm của bạn với sản phẩm này...",
    images: "Hình ảnh (tùy chọn)",
    submit: "Gửi đánh giá",
    submitting: "Đang gửi...",
    success: "Gửi đánh giá thành công!",
    error: "Gửi đánh giá thất bại. Vui lòng thử lại.",
    required: "Trường này là bắt buộc",
    minRating: "Vui lòng chọn đánh giá",
    minCommentLength: "Đánh giá phải có ít nhất 10 ký tự"
  },
  unreviewedSection: {
    title: "Bạn đã mua sản phẩm này",
    subtitle: "Chia sẻ trải nghiệm để giúp khách hàng khác",
    writeReview: "Viết đánh giá",
    purchasedOn: "Đã mua vào {date}"
  }
},
bestSellingPage: {
  breadcrumb: {
    home: "Trang chủ",
    products: "Sản phẩm"
  },
  sidebar: {
    category: "Danh mục",
    price: "Giá",
    min: "Tối thiểu",
    max: "Tối đa",
    brand: "Thương hiệu",
    findBrandPlaceholder: "Tìm thương hiệu",
    showLess: "Ẩn bớt",
    showMore: "+ {count} thêm",
    customerRating: "Đánh giá khách hàng"
  },
  sort: {
    results: "{count} kết quả",
    sortBy: "Sắp xếp theo",
    relevance: "Liên quan",
    priceLow: "Giá: Thấp đến Cao",
    priceHigh: "Giá: Cao đến Thấp",
    rating: "Đánh giá khách hàng",
    newest: "Mới nhất",
    bestselling: "Bán chạy nhất"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  },
  product: {
    price: "{price}₫",
    addToWishlist: "Thêm vào yêu thích"
  },
  loading: "Đang tải...",
  error: {
    fetch: "Không thể tải sản phẩm bán chạy",
    general: "Đã xảy ra lỗi khi tải dữ liệu"
  },
  searchPlaceholder: "Tìm theo tên hoặc danh mục..."
},
searchPage: {
  breadcrumb: {
    home: "Trang chủ",
    products: "Sản phẩm"
  },
  sidebar: {
    category: "Danh mục",
    all: "Tất cả",
    price: "Giá",
    min: "Tối thiểu",
    max: "Tối đa",
    brand: "Thương hiệu",
    findBrandPlaceholder: "Tìm thương hiệu",
    showLess: "Ẩn bớt",
    showMore: "+ {count} thêm",
    customerRating: "Đánh giá khách hàng"
  },
  sort: {
    results: "{count} kết quả",
    sortBy: "Sắp xếp theo",
    relevance: "Liên quan",
    priceLow: "Giá: Thấp đến Cao",
    priceHigh: "Giá: Cao đến Thấp",
    rating: "Đánh giá khách hàng",
    newest: "Mới nhất",
    bestselling: "Bán chạy nhất"
  },
  pagination: {
    previous: "Trước",
    next: "Tiếp"
  },
  product: {
    price: "{price}₫",
    addToWishlist: "Thêm vào yêu thích"
  }
}
};

export default pagesConfig;
