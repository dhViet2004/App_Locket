import { Text, View, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";

const { width: screenWidth } = Dimensions.get('window');

const tutorialSteps = [
  {
    id: 1,
    title: "Thêm tiện ích vào màn hình chính của bạn",
    instruction: "Nhấn và giữ một khoảng trống trên Màn hình chính của bạn",
    image: require('../../assets/images/huongdan1.png'),
  },
  {
    id: 2,
    title: "Thêm tiện ích vào màn hình chính của bạn",
    instruction: "Chạm vào nút \"Tiện ích\" để thêm một tiện ích mới",
    image: require('../../assets/images/huongdan2.png'),
  },
  {
    id: 3,
    title: "Thêm tiện ích vào màn hình chính của bạn",
    instruction: "Tìm Locket và thêm tiện ích",
    image: require('../../assets/images/huongdan3.png'),
  },
  {
    id: 4,
    title: "Thêm tiện ích vào màn hình chính của bạn",
    instruction: "Giữ và kéo để sắp xếp và đổi kích cỡ",
    image: require('../../assets/images/huongdan4.png'),
  },
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * screenWidth,
        animated: true,
      });
    } else {
      // Navigate to main app after completing tutorial
      router.replace("/");
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentStep(index);
  };

  const handleComplete = () => {
    setShowModal(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleModalContinue = () => {
    setShowModal(false);
    router.push("/register/completion");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#000000" />
      
        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>
            {tutorialSteps[currentStep].title}
          </Text>

          {/* Tutorial Images Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              style={styles.carousel}
            >
              {tutorialSteps.map((step, index) => (
                <View key={step.id} style={styles.stepContainer}>
                  <Image 
                    source={step.image}
                    style={styles.tutorialImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Instruction Text */}
          <Text style={styles.instruction}>
            {tutorialSteps[currentStep].instruction}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={currentStep === tutorialSteps.length - 1 ? handleComplete : handleNext}
          >
            <Text style={styles.actionButtonText}>
              {currentStep === tutorialSteps.length - 1 ? "Tôi đã bật tiện ích" : "Tiếp theo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleModalCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Bạn đã bật tiện ích chưa?</Text>
              <Text style={styles.modalContent}>
                Locket không hoạt động trừ khi bạn thêm tiện ích vào màn hình chính của mình.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleModalCancel} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleModalContinue} style={styles.modalContinueButton}>
                  <Text style={styles.modalContinueText}>Tiếp tục</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  carouselContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    flex: 1,
  },
  stepContainer: {
    width: screenWidth - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialImage: {
    width: '100%',
    height: 400,
  },
  instruction: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    backgroundColor: '#666666',
  },
  actionButton: {
    backgroundColor: '#333333',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  modalCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalContinueButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalContinueText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
});
