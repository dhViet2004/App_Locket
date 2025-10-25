import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Smileys & People');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Grid view states
  const [viewMode, setViewMode] = useState<'fullscreen' | 'grid'>('fullscreen');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Mock data for history feed - matching the sample image
  const historyData = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&crop=center',
      message: 'm đúng k Tuyết',
      sender: {
        name: 'be',
        avatar: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1761231281/taskmanagement/avatars/a0hsc7oncibdgnvhbgbp.jpg',
        time: '3h'
      }
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center',
      message: 'Chào buổi sáng!',
      sender: {
        name: 'Alice',
        avatar: 'https://via.placeholder.com/40x40/666/fff?text=A',
        time: '5h'
      }
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop&crop=center',
      message: 'Hôm nay trời đẹp quá',
      sender: {
        name: 'Bob',
        avatar: 'https://via.placeholder.com/40x40/666/fff?text=B',
        time: '1d'
      }
    }
  ];

  // Emoji categories for the picker
  const emojiCategories = {
    'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    'Food & Drink': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽', '🥕', '🫑', '🥔', '🍠', '🥔', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕'],
    'Activity': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🪁', '🎪', '🤹', '🤹‍♀️', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🪘', '🥁', '🪗', '🎸', '🪕', '🎺', '🎷', '🪗', '🎹', '🎻', '🪕'],
    'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🚉', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🎢', '🎡', '🎠', '🚁', '✈️'],
    'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '🧮', '🎥', '📷', '📸', '📹', '🎞️', '📽️', '🎬', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎'],
    'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '💯', '🔥', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸']
  };


  const handleQuickReaction = (emoji: string) => {
    console.log('Quick reaction:', emoji);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getFilteredEmojis = () => {
    if (searchQuery) {
      const allEmojis = Object.values(emojiCategories).flat();
      return allEmojis.filter(emoji => emoji.includes(searchQuery));
    }
    return emojiCategories[selectedCategory as keyof typeof emojiCategories] || [];
  };

  const categoryIcons = {
    'Smileys & People': 'happy-outline',
    'Animals & Nature': 'leaf-outline',
    'Food & Drink': 'restaurant-outline',
    'Activity': 'football-outline',
    'Travel & Places': 'airplane-outline',
    'Objects': 'bulb-outline',
    'Symbols': 'ban-outline'
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleChat = () => {
    console.log('Open chat');
  };

  const handleFriends = () => {
    console.log('Open friends list');
  };

  const handleCamera = () => {
    router.push('/home');
  };

  const handleGrid = () => {
    setViewMode(viewMode === 'fullscreen' ? 'grid' : 'fullscreen');
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
  };

  const handleImagePress = (imageId: string) => {
    if (viewMode === 'grid') {
      setViewMode('fullscreen');
      // Scroll to specific image
    }
  };

  const handleGestureEvent = (event: any) => {
    // Track gesture progress if needed
  };

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Check if it's a swipe up gesture - more sensitive thresholds
      if (translationY < -30 && velocityY < -300) {
        // Swipe up detected - switch to fullscreen
        setViewMode('fullscreen');
      }
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          navigationBarColor: '#000000',
          statusBarStyle: 'light',
          statusBarBackgroundColor: '#000000'
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View style={styles.header}>
          {viewMode === 'fullscreen' ? (
            /* Full Screen Header */
            <>
              <TouchableOpacity onPress={handleProfile} style={styles.headerButton}>
                <Ionicons name="person-outline" size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleFriends} style={styles.friendsButton}>
                <Ionicons name="people-outline" size={20} color="#fff" />
                <Text style={styles.friendsText}>3 Bạn bè</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleChat} style={styles.headerButton}>
                <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            /* Grid View Header */
            <>
              <TouchableOpacity onPress={handleProfile} style={styles.headerButton}>
                <Image 
                  source={{ uri: 'https://res.cloudinary.com/dh1o42tjk/image/upload/v1761231281/taskmanagement/avatars/a0hsc7oncibdgnvhbgbp.jpg' }} 
                  style={styles.profileAvatar} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setShowFilterModal(true)} 
                style={styles.filterButton}
              >
                <Text style={styles.filterText}>
                  {selectedFilter === 'all' ? 'Tất cả bạn bè' : selectedFilter} ⌄
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleCamera} style={styles.headerButton}>
                <Ionicons name="camera" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Main Content - Conditional Rendering */}
        {viewMode === 'fullscreen' ? (
          /* Full Screen View */
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={screenHeight - 200}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {historyData.map((item, index) => (
              <View key={item.id} style={styles.feedItem}>
                {/* Image Container - Full screen */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.feedImage} />
                  {item.message && (
                    <View style={styles.messageOverlay}>
                      <Text style={styles.messageText}>{item.message}</Text>
                    </View>
                  )}
                </View>
                
                {/* Sender Info - Below image */}
                <View style={styles.senderInfo}>
                  <Image source={{ uri: item.sender.avatar }} style={styles.senderAvatar} />
                  <Text style={styles.senderName}>{item.sender.name}</Text>
                  <Text style={styles.senderTime}>{item.sender.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          /* Grid View */
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleGestureStateChange}
          >
            <View style={styles.gridContainer}>
              <ScrollView 
                style={styles.gridScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContent}
              >
                {historyData.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.gridItem}
                    onPress={() => handleImagePress(item.id)}
                  >
                    <Image source={{ uri: item.image }} style={styles.gridImage} />
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridSenderName}>{item.sender.name}</Text>
                      <Text style={styles.gridTime}>{item.sender.time}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </PanGestureHandler>
        )}

        {/* Interaction Area - Only show in fullscreen mode */}
        {viewMode === 'fullscreen' && (
          <View style={styles.interactionArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Gửi tin nhắn..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <View style={styles.emojiContainer}>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => handleQuickReaction('💛')}
                >
                  <Text style={styles.emojiText}>💛</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => handleQuickReaction('🔥')}
                >
                  <Text style={styles.emojiText}>🔥</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => handleQuickReaction('🥰')}
                >
                  <Text style={styles.emojiText}>🥰</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => handleQuickReaction('😂')}
                >
                  <Text style={styles.emojiText}>😂</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.sendButton}>
                <Ionicons name="happy-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Navigation - Only show in fullscreen mode */}
        {viewMode === 'fullscreen' && (
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={handleGrid} style={styles.navButton}>
              <Ionicons 
                name="grid-outline" 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleCamera} style={styles.cameraButton}>
              <View style={styles.cameraButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}


        {/* Emoji Picker Modal */}
        <Modal
          visible={showEmojiPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity 
            style={styles.emojiModalOverlay}
            activeOpacity={1}
            onPress={() => setShowEmojiPicker(false)}
          >
            <TouchableOpacity 
              style={styles.emojiModal}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Search Bar */}
              <View style={styles.emojiSearchContainer}>
                <TextInput
                  style={styles.emojiSearchInput}
                  placeholder="Search"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Category Title */}
              <View style={styles.emojiCategoryHeader}>
                <Text style={styles.emojiCategoryTitle}>
                  {searchQuery ? 'Search Results' : selectedCategory}
                </Text>
              </View>

              {/* Emoji Grid Container */}
              <View style={styles.emojiGridContainer}>
                <ScrollView 
                  style={styles.emojiModalContent}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.emojiScrollContent}
                >
                  <View style={styles.emojiGrid}>
                    {getFilteredEmojis().map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.emojiPickerButton}
                        onPress={() => handleEmojiSelect(emoji)}
                      >
                        <Text style={styles.emojiPickerText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Category Navigation */}
              <View style={styles.emojiCategoryNav}>
                {Object.keys(emojiCategories).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.emojiCategoryButton,
                      selectedCategory === category && styles.emojiCategoryButtonActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setSearchQuery('');
                    }}
                  >
                    <Ionicons 
                      name={categoryIcons[category as keyof typeof categoryIcons] as any} 
                      size={20} 
                      color={selectedCategory === category ? '#fff' : '#666'} 
                    />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.emojiCategoryButton}>
                  <Ionicons name="search-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableOpacity 
            style={styles.filterModalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          >
            <TouchableOpacity 
              style={styles.filterModal}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Lọc theo bạn bè</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.filterContent}>
                <TouchableOpacity 
                  style={[styles.filterOption, selectedFilter === 'all' && styles.filterOptionSelected]}
                  onPress={() => handleFilterChange('all')}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === 'all' && styles.filterOptionTextSelected]}>
                    Tất cả bạn bè
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterOption, selectedFilter === 'be' && styles.filterOptionSelected]}
                  onPress={() => handleFilterChange('be')}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === 'be' && styles.filterOptionTextSelected]}>
                    be
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterOption, selectedFilter === 'Alice' && styles.filterOptionSelected]}
                  onPress={() => handleFilterChange('Alice')}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === 'Alice' && styles.filterOptionTextSelected]}>
                    Alice
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterOption, selectedFilter === 'Bob' && styles.filterOptionSelected]}
                  onPress={() => handleFilterChange('Bob')}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === 'Bob' && styles.filterOptionTextSelected]}>
                    Bob
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
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
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  friendsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  feedItem: {
    height: screenHeight - 200, // Full screen minus header and bottom areas
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: screenWidth - 40, // Full width with some padding
    height: screenWidth - 40, // Square aspect ratio
    alignSelf: 'center',
    borderRadius: 70, // Same as cameraContainer in home.tsx
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  feedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  messageOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    alignSelf: 'center',
    width: screenWidth - 80,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  senderDetails: {
    marginLeft: 12,
  },
  senderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  senderTime: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
  },
  interactionArea: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  messageInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 5,
  },
  emojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  emojiButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  emojiText: {
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  navButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffd700',
  },
  cameraButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  // Emoji Picker Modal Styles
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  emojiModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.8,
    flexDirection: 'column',
  },
  emojiSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  emojiSearchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  emojiCategoryHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  emojiCategoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emojiGridContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  emojiModalContent: {
    flex: 1,
  },
  emojiScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  emojiPickerButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 22.5,
    backgroundColor: 'transparent',
  },
  emojiPickerText: {
    fontSize: 24,
  },
  emojiCategoryNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  emojiCategoryButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emojiCategoryButtonActive: {
    backgroundColor: '#333',
  },
  // Grid View Styles
  gridContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 20, // Add some bottom padding for better UX
  },
  gridScrollView: {
    flex: 1,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  gridItem: {
    width: (screenWidth - 6) / 3,
    aspectRatio: 1,
    margin: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gridSenderName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gridTime: {
    color: '#ccc',
    fontSize: 10,
  },
  // Grid Header Styles
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.5,
    paddingHorizontal: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  filterContent: {
    flex: 1,
    paddingTop: 20,
  },
  filterOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  filterOptionSelected: {
    backgroundColor: '#FF8C00',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
});
