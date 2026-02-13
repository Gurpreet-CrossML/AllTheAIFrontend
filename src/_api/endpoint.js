//end-points for auth module
export const getProfile = 'api/auth/profile/';
export const authRegister = 'api/auth/register/';
export const authLogin = 'api/auth/login/';
export const authLogout = 'api/auth/logout/';
export const authforgotPassword = 'api/auth/forgot_password/';
export const verfiyAuthForgotPassword = 'api/auth/verify_forgot_password/';

//end-points for billing details
export const getSubscription = 'api/billing/pricing/';
export const subscribePlan = 'api/billing/subscription/';
export const subscriptionCancel = 'api/billing/subscription/cancel/';
export const billingDetails = 'api/billing/details/';
export const billingAddress = 'api/billing/address/';
export const billingCheckout = 'api/billing/checkout/';

// end-points for Content Generation Module
export const contentTemplate = 'api/content_generation/templates/';
export const templateConfig = 'api/content_generation/template_config/';
export const contentGenerate = 'api/content_generation/generate/';
export const contentUpdate = 'api/content_generation/update/';
export const contentHistory = 'api/content_generation/generated_content/history/'; // used in dashboard and content-history
export const categoriesList = 'api/content_generation/categories/';
export const contentEventHistory = 'api/content_generation/generated_content/events/';
export const searchGeneratedContent = 'api/content_generation/generated_content/history/?search=';
export const contentPageSize = 'api/content_generation/generated_content/history/?page_size=';
export const templateCategory = 'api/content_generation/templates/?cat=';
export const pageSizeHistory = 'api/content_generation/generated_content/history/?page_size=10';

//end-points for Image Generation Module
export const imageGenerate = 'api/image_generation/generate/image/';
export const imageList = 'api/image_generation/generated_image/history/';
export const historyImage = 'api/image_generation/generated_image/detail/';
export const imageModel = 'api/image_generation/models/';
export const imageConfig = 'api/image_generation/template_config/';
export const imgTemplate = 'api/image_generation/image/templates/';
export const pageSizeImg = 'api/image_generation/generated_image/history/?page_size=';
export const pageChangeImg = 'api/image_generation/generated_image/history/?page=';
export const filterChangeImg = 'api/image_generation/generated_image/history/?search=';

//end-points for Persona Module
export const personaList = 'api/persona/';
export const createPersona = 'api/persona/create/';
export const targetAudience = 'api/persona/target-audiences/';
export const tones = 'api/persona/tones/';
export const personaDetail = 'api/persona/';
export const industriesList = 'api/persona/industries/';
export const personaTypes = 'api/persona/persona_types/';
export const updatePersona = 'api/persona/edit/';
export const deletePersona = 'api/persona/delete/';
export const personaStatus = 'api/persona/change_status/';
export const personaSearch = 'api/persona/?search=';
export const activePersona = 'api/persona/?page_size=all&persona_status=active';
export const pagePersona = 'api/persona/?page=';
export const pageSizePersonna = 'api/persona/?page_size=';
export const personaDropdown = 'api/persona/?page_size=all&persona_status=active';

//end-points for Social-Media Module
export const SocialMediaTemplate = 'api/social/platforms/';
export const createSchedule = 'api/social/schedule/create/';
export const socialPost = 'api/social/post/create/';
export const connectSocialMedia = 'api/social/platforms/connected/';
export const disconnectSocialPlatform = 'api/social/disconnect/';
export const updateSchedular = 'api/social/schedule/update/';
export const deleteSchedule = 'api/social/schedule/delete/';
export const linkedinConnect = 'api/social/linkedin/connect/';
export const twitterConnect = 'api/social/twitter/connect/';
export const facebookConnect = 'api/social/meta/connect/';
export const facebookPage = 'api/social/facebook/pages/';
export const instagramPage = 'api/social/meta/instagram_business_account/';

//end-points for Transaction Module
export const transactionList = 'api/billing/transaction/';
export const pageSizeTransaction = 'api/billing/transaction/?page_size=5';

//end-points Dashboard Module
export const activeSubscription = 'api/billing/subscription/active/';
