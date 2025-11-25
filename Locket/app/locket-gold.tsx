import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient'; // Temporarily disabled

const { width: screenWidth } = Dimensions.get('window');

// Mock data cho pricing plans
const PRICING_PLANS = [
    {
        id: 'monthly',
        name: 'Hàng tháng',
        price: '49,000₫',
        pricePerMonth: '49,000₫/tháng',
        duration: '1 tháng',
        popular: false,
        savings: null,
    },
    {
        id: 'yearly',
        name: 'Hàng năm',
        price: '399,000₫',
        pricePerMonth: '33,250₫/tháng',
        duration: '12 tháng',
        popular: true,
        savings: 'Tiết kiệm 32%',
    },
    {
        id: 'lifetime',
        name: 'Trọn đời',
        price: '999,000₫',
        pricePerMonth: 'Một lần duy nhất',
        duration: 'Vĩnh viễn',
        popular: false,
        savings: 'Giá trị tốt nhất',
    },
];

// Mock data cho premium features
const PREMIUM_FEATURES = [
    {
        icon: 'infinite-outline',
        title: 'Không giới hạn lịch sử',
        description: 'Xem lại tất cả khoảnh khắc của bạn',
    },
    {
        icon: 'color-palette-outline',
        title: 'Chủ đề độc quyền',
        description: 'Tùy chỉnh giao diện theo phong cách riêng',
    },
    {
        icon: 'images-outline',
        title: 'Widget cao cấp',
        description: 'Nhiều kiểu widget đẹp mắt hơn',
    },
    {
        icon: 'cloud-upload-outline',
        title: 'Sao lưu không giới hạn',
        description: 'Lưu trữ đám mây an toàn',
    },
    {
        icon: 'sparkles-outline',
        title: 'AI nâng cao',
        description: 'Gợi ý caption thông minh hơn',
    },
    {
        icon: 'notifications-off-outline',
        title: 'Không quảng cáo',
        description: 'Trải nghiệm mượt mà, không gián đoạn',
    },
];

// Mock data cho payment methods
const PAYMENT_METHODS = [
    {
        id: 'momo',
        name: 'Ví MoMo',
        icon: '💳',
        description: 'Thanh toán qua ví điện tử MoMo',
        popular: true,
    },
    {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        icon: '🏦',
        description: 'Chuyển khoản qua VietQR hoặc số tài khoản',
        popular: false,
    },
    {
        id: 'credit_card',
        name: 'Thẻ tín dụng/ghi nợ',
        icon: '💳',
        description: 'Visa, Mastercard, JCB',
        popular: false,
    },
    {
        id: 'zalopay',
        name: 'ZaloPay',
        icon: '💰',
        description: 'Thanh toán qua ví ZaloPay',
        popular: false,
    },
];

export default function LocketGoldScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleSubscribe = () => {
        const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
        if (!plan) return;

        // Show payment modal instead of alert
        setShowPaymentModal(true);
    };

    const handleSelectPaymentMethod = (methodId: string) => {
        setSelectedPaymentMethod(methodId);
    };

    const handleConfirmPayment = () => {
        const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
        const method = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);

        if (!plan || !method) return;

        setShowPaymentModal(false);

        // Simulate payment processing
        Alert.alert(
            'Đang xử lý thanh toán',
            `Phương thức: ${method.name}\nGói: ${plan.name}\nSố tiền: ${plan.price}\n\nTính năng thanh toán thực tế sẽ được tích hợp sau.`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        Alert.alert('Thành công', 'Cảm ơn bạn đã đăng ký Locket Gold! 💛');
                        router.back();
                    },
                },
            ]
        );
    };

    const handleRestore = () => {
        Alert.alert('Khôi phục gói đăng ký', 'Tính năng khôi phục sẽ được tích hợp sau.');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                    navigationBarColor: '#000000',
                    statusBarStyle: 'light',
                    statusBarBackgroundColor: '#000000',
                }}
            />
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRestore}>
                        <Text style={styles.restoreText}>Khôi phục</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.goldBadge}>
                            <Text style={styles.goldEmoji}>💛</Text>
                        </View>
                        <Text style={styles.heroTitle}>Locket Gold</Text>
                        <Text style={styles.heroSubtitle}>
                            Mở khóa trải nghiệm Locket tốt nhất
                        </Text>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Tính năng cao cấp</Text>
                        {PREMIUM_FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <View style={styles.featureIconContainer}>
                                    <Ionicons name={feature.icon as any} size={24} color="#FFD700" />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            </View>
                        ))}
                    </View>

                    {/* Pricing Plans */}
                    <View style={styles.pricingSection}>
                        <Text style={styles.sectionTitle}>Chọn gói phù hợp</Text>
                        {PRICING_PLANS.map((plan) => (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    selectedPlan === plan.id && styles.planCardSelected,
                                    plan.popular && styles.planCardPopular,
                                ]}
                                onPress={() => handleSelectPlan(plan.id)}
                            >
                                {plan.popular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularBadgeText}>PHỔ BIẾN NHẤT</Text>
                                    </View>
                                )}

                                <View style={styles.planHeader}>
                                    <View style={styles.planInfo}>
                                        <Text style={styles.planName}>{plan.name}</Text>
                                        <Text style={styles.planDuration}>{plan.duration}</Text>
                                    </View>
                                    <View style={styles.planPricing}>
                                        <Text style={styles.planPrice}>{plan.price}</Text>
                                        <Text style={styles.planPricePerMonth}>{plan.pricePerMonth}</Text>
                                    </View>
                                </View>

                                {plan.savings && (
                                    <View style={styles.savingsBadge}>
                                        <Text style={styles.savingsText}>{plan.savings}</Text>
                                    </View>
                                )}

                                <View style={styles.radioButton}>
                                    {selectedPlan === plan.id ? (
                                        <View style={styles.radioButtonSelected}>
                                            <View style={styles.radioButtonInner} />
                                        </View>
                                    ) : (
                                        <View style={styles.radioButtonUnselected} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Terms */}
                    <View style={styles.termsSection}>
                        <Text style={styles.termsText}>
                            • Thanh toán sẽ được tính vào tài khoản của bạn khi xác nhận mua hàng
                        </Text>
                        <Text style={styles.termsText}>
                            • Gói đăng ký sẽ tự động gia hạn trừ khi bạn tắt tính năng này ít nhất 24 giờ trước khi kết thúc chu kỳ hiện tại
                        </Text>
                        <Text style={styles.termsText}>
                            • Bạn có thể quản lý và hủy đăng ký bất kỳ lúc nào trong cài đặt tài khoản
                        </Text>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>

                {/* Subscribe Button */}
                <View style={[styles.subscribeButtonContainer, { paddingBottom: 20 + insets.bottom }]}>
                    <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={handleSubscribe}
                    >
                        <View style={styles.subscribeButtonGradient}>
                            <Text style={styles.subscribeButtonText}>
                                Đăng ký ngay - {PRICING_PLANS.find(p => p.id === selectedPlan)?.price}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Payment Modal */}
                <Modal
                    visible={showPaymentModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPaymentModal(false)}
                >
                    <View style={styles.paymentModalOverlay}>
                        <View style={[styles.paymentModalContent, { paddingBottom: 20 + insets.bottom }]}>
                            {/* Modal Header */}
                            <View style={styles.paymentModalHeader}>
                                <Text style={styles.paymentModalTitle}>Chọn phương thức thanh toán</Text>
                                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Selected Plan Info */}
                            <View style={styles.selectedPlanInfo}>
                                <Text style={styles.selectedPlanName}>
                                    {PRICING_PLANS.find(p => p.id === selectedPlan)?.name}
                                </Text>
                                <Text style={styles.selectedPlanPrice}>
                                    {PRICING_PLANS.find(p => p.id === selectedPlan)?.price}
                                </Text>
                            </View>

                            {/* Payment Methods List */}
                            <View style={styles.paymentMethodsContainer}>
                                <ScrollView
                                    style={styles.paymentMethodsList}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <TouchableOpacity
                                            key={method.id}
                                            style={[
                                                styles.paymentMethodItem,
                                                selectedPaymentMethod === method.id && styles.paymentMethodItemSelected,
                                            ]}
                                            onPress={() => handleSelectPaymentMethod(method.id)}
                                        >
                                            {method.popular && (
                                                <View style={styles.paymentPopularBadge}>
                                                    <Text style={styles.paymentPopularText}>PHỔ BIẾN</Text>
                                                </View>
                                            )}

                                            <View style={styles.paymentMethodLeft}>
                                                <View style={styles.paymentMethodIcon}>
                                                    <Text style={styles.paymentMethodEmoji}>{method.icon}</Text>
                                                </View>
                                                <View style={styles.paymentMethodInfo}>
                                                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                                                    <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.paymentRadioButton}>
                                                {selectedPaymentMethod === method.id ? (
                                                    <View style={styles.paymentRadioButtonSelected}>
                                                        <View style={styles.paymentRadioButtonInner} />
                                                    </View>
                                                ) : (
                                                    <View style={styles.paymentRadioButtonUnselected} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Confirm Payment Button */}
                            <TouchableOpacity
                                style={[
                                    styles.confirmPaymentButton,
                                    !selectedPaymentMethod && styles.confirmPaymentButtonDisabled,
                                ]}
                                onPress={handleConfirmPayment}
                                disabled={!selectedPaymentMethod}
                            >
                                <View style={[
                                    styles.confirmPaymentButtonGradient,
                                    !selectedPaymentMethod && { backgroundColor: '#333' }
                                ]}>
                                    <Text style={[
                                        styles.confirmPaymentButtonText,
                                        !selectedPaymentMethod && styles.confirmPaymentButtonTextDisabled,
                                    ]}>
                                        Xác nhận thanh toán
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restoreText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        // paddingBottom will be set dynamically with insets
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    goldBadge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#FFD700', // Fallback color
    },
    goldEmoji: {
        fontSize: 50,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFD700',
        marginBottom: 10,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#999',
        lineHeight: 20,
    },
    pricingSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    planCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#333',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#FFD700',
        backgroundColor: '#2A2A1A',
    },
    planCardPopular: {
        borderColor: '#FFA500',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        backgroundColor: '#FFA500',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    planDuration: {
        fontSize: 14,
        color: '#999',
    },
    planPricing: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFD700',
        marginBottom: 4,
    },
    planPricePerMonth: {
        fontSize: 13,
        color: '#999',
    },
    savingsBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    savingsText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    radioButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    radioButtonSelected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFD700',
    },
    radioButtonUnselected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
    },
    termsSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    termsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
    },
    bottomSpacing: {
        height: 20,
    },
    subscribeButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    subscribeButton: {
        borderRadius: 30,
        overflow: 'hidden',
    },
    subscribeButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        backgroundColor: '#FFD700', // Fallback color
    },
    subscribeButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    // Payment Modal Styles
    paymentModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    paymentModalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        maxHeight: '90%',
    },
    paymentModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    paymentModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    selectedPlanInfo: {
        backgroundColor: '#2A2A2A',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    selectedPlanName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    selectedPlanPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFD700',
    },
    paymentMethodsContainer: {
        height: 400,
    },
    paymentMethodsList: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    paymentMethodItem: {
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    paymentMethodItemSelected: {
        borderColor: '#FFD700',
        backgroundColor: '#3A3A2A',
    },
    paymentPopularBadge: {
        position: 'absolute',
        top: -8,
        right: 16,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    paymentPopularText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentMethodIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3A3A3A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    paymentMethodEmoji: {
        fontSize: 24,
    },
    paymentMethodInfo: {
        flex: 1,
    },
    paymentMethodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    paymentMethodDescription: {
        fontSize: 13,
        color: '#999',
    },
    paymentRadioButton: {
        marginLeft: 12,
    },
    paymentRadioButtonSelected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentRadioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFD700',
    },
    paymentRadioButtonUnselected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
    },
    confirmPaymentButton: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 30,
        overflow: 'hidden',
    },
    confirmPaymentButtonDisabled: {
        opacity: 0.5,
    },
    confirmPaymentButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        backgroundColor: '#FFD700', // Fallback color
    },
    confirmPaymentButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    confirmPaymentButtonTextDisabled: {
        color: '#666',
    },
});
