// @ts-ignore: Bypassing IDE cache bug
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, useSharedValue, withSpring, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Users,
  MessageCircle,
  Heart,
  MoreHorizontal,
  PenSquare,
  Search,
  X,
  Star,
  CheckCircle2
} from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

type TabType = 'discussions' | 'groups' | 'peers';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = theme;
  const styles = createStyles(theme);
  
  const [activeTab, setActiveTab] = useState<TabType>('discussions');

  const [feed, setFeed] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [peers, setPeers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Final Year Stress');
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const fetchAllData = async () => {
    try {
      const [feedRes, groupsRes, peersRes] = await Promise.all([
        api.get('/community').catch(() => ({ data: [] })),
        api.get('/groups').catch(() => ({ data: [] })),
        api.get('/peers').catch(() => ({ data: [] }))
      ]);
      setFeed(feedRes.data);
      setGroups(groupsRes.data);
      setPeers(peersRes.data);
    } catch (error: any) {
      console.warn('Network timeout fetching community data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Empty Post', 'Please write a message before publishing.');
      return;
    }
    setPublishing(true);
    try {
      const response = await api.post('/community', {
        content: postContent,
        group: selectedGroup
      });
      setFeed((prev: any[]) => [response.data, ...prev]);
      setPostContent('');
      setIsCreateVisible(false);
      Alert.alert('Shared!', 'Your anonymous thought has been published to the community.');
    } catch (error) {
      console.error('Error sharing thought:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleHug = async (postId: string) => {
    try {
      const response = await api.post(`/community/${postId}/hug`);
      setFeed(feed.map((p: any) => {
        if (p.id === postId) {
          if (response.data.action === 'unhugged') {
            return { ...p, hugs: Math.max(0, p.hugs - 1), hasHugged: false };
          } else {
            return { ...p, hugs: p.hugs + 1, hasHugged: true };
          }
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling hug:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('community.just_now');
    if (diffInHours < 24) return `${diffInHours}${t('community.hours_ago')}`;
    return `${Math.floor(diffInHours / 24)}${t('community.days_ago')}`;
  };

  const getSortedFeed = () => {
    const sorted = [...feed];
    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      sorted.sort((a, b) => (b.hugs || 0) - (a.hugs || 0));
    }
    return sorted;
  };

  const PostCard = ({ post, index }: { post: any, index: number }) => {
    const hugScale = useSharedValue(1);
    const animatedHugStyle = useAnimatedStyle(() => ({ transform: [{ scale: hugScale.value }] }));

    const handleHugPress = () => {
      hugScale.value = withSequence(
        withSpring(1.4, { damping: 2, stiffness: 80 }),
        withSpring(1, { damping: 4, stiffness: 40 })
      );
      handleHug(post.id);
    };

    return (
      <Animated.View entering={FadeInUp.delay(Math.min(index, 10) * 50).duration(500)} style={[styles.postCard, { marginHorizontal: 24, marginBottom: 16 }]}>
        <View style={styles.postHeader}>
          <View style={styles.postAuthorInfo}>
            <View style={[styles.postAvatar, { backgroundColor: theme.colors.accents.powderBlue }]} />
            <View>
              <Text style={styles.postGroup}>{post.group}</Text>
              <Text style={styles.postTime}>{formatDate(post.createdAt)} • Anonymous</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <MoreHorizontal color={theme.colors.text.tertiary} size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleHugPress} activeOpacity={0.7}>
            <Animated.View style={animatedHugStyle}>
              <Heart 
                color={post.hasHugged ? theme.colors.semantic.danger : theme.colors.accents.dustyRose} 
                size={18} 
                fill={post.hasHugged ? theme.colors.semantic.danger : theme.colors.accents.dustyRose + '20'} 
              />
            </Animated.View>
            <Text style={[styles.actionText, post.hasHugged && { color: theme.colors.semantic.danger }]}>{post.hugs} {t('community.send_hug')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <MessageCircle color={theme.colors.text.secondary} size={18} />
            <Text style={styles.actionText}>{post.comments || 0} {t('community.comment')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const formatMembers = (num: number) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const GroupCard = ({ group, index }: { group: any, index: number }) => {
    const [isJoined, setIsJoined] = useState(false);
    const [memberCount, setMemberCount] = useState(group.members || 0);

    const handleJoin = () => {
      if (isJoined) {
        setIsJoined(false);
        setMemberCount((prev: number) => prev - 1);
      } else {
        setIsJoined(true);
        setMemberCount((prev: number) => prev + 1);
      }
    };

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(400)} style={styles.groupListCard}>
        <View style={styles.groupListHeader}>
          <View style={[styles.groupListIconWrap, { backgroundColor: (group.color || theme.colors.plum) + '15' }]}>
            <Users color={group.color || theme.colors.plum} size={24} />
          </View>
          <View style={styles.groupListInfo}>
            <Text style={styles.groupListTitle}>{group.name}</Text>
            <Text style={styles.groupListMembers}>{formatMembers(memberCount)} Members</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.joinBtn, 
              { 
                backgroundColor: isJoined ? 'transparent' : theme.colors.plum,
                borderWidth: isJoined ? 1 : 0,
                borderColor: theme.colors.plum
              }
            ]}
            onPress={handleJoin}
          >
            <Text style={[
              styles.joinBtnText, 
              { color: isJoined ? theme.colors.plum : '#FFF' }
            ]}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.groupListDesc} numberOfLines={2}>{group.description}</Text>
      </Animated.View>
    );
  };

  const PeerCard = ({ peer, index }: { peer: any, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)} style={styles.peerCard}>
      <View style={styles.peerHeader}>
        <View style={styles.peerAvatarWrap}>
          <View style={[styles.peerAvatarPlaceholder, { backgroundColor: theme.colors.accents.powderBlue }]} />
          {peer.isAvailable && (
            <View style={[styles.peerOnlineBadge, { backgroundColor: theme.colors.semantic.success }]} />
          )}
        </View>
        <View style={styles.peerInfo}>
          <View style={styles.peerNameRow}>
            <Text style={styles.peerName}>{peer.user?.name || 'Anonymous Peer'}</Text>
            <CheckCircle2 color={theme.colors.semantic.success} size={16} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.peerRatingRow}>
            <Star color="#F5A623" fill="#F5A623" size={14} />
            <Text style={styles.peerRating}>{peer.rating.toFixed(1)} Rating</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.colors.plum }]}>
          <MessageCircle color="#FFF" size={16} />
          <Text style={styles.msgBtnText}>Connect</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.peerBio}>{peer.bio}</Text>
      <View style={styles.peerSpecialties}>
        {peer.specialties?.map((spec: string, idx: number) => (
          <View style={[styles.specChip, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={styles.specChipText}>{spec}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.plum} />
        </View>
      );
    }

    if (activeTab === 'discussions') {
      return (
        <FlatList 
          data={getSortedFeed()}
          keyExtractor={post => post.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.feedHeaderRow}>
              <Text style={styles.sectionTitle}>{t('community.recent_discussions')}</Text>
              <View style={styles.filterToggle}>
                <TouchableOpacity onPress={() => setSortBy('recent')} style={[styles.filterToggleBtn, sortBy === 'recent' && { backgroundColor: theme.colors.plum }]}>
                  <Text style={[styles.filterToggleText, sortBy === 'recent' && { color: '#FFF' }]}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortBy('popular')} style={[styles.filterToggleBtn, sortBy === 'popular' && { backgroundColor: theme.colors.plum }]}>
                  <Text style={[styles.filterToggleText, sortBy === 'popular' && { color: '#FFF' }]}>Popular</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.plum + '15' }]}>
                <MessageCircle color={theme.colors.plum} size={32} />
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No discussions yet. Be the first to share!</Text>
            </View>
          }
          renderItem={({ item, index }) => <PostCard post={item} index={index} />}
        />
      );
    }

    if (activeTab === 'groups') {
      return (
        <FlatList 
          data={groups}
          keyExtractor={g => g.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120, paddingHorizontal: 24 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.feedHeaderRow}>
              <Text style={styles.sectionTitle}>Explore Groups</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.plum + '15' }]}>
                <Users color={theme.colors.plum} size={32} />
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No support groups available yet.</Text>
            </View>
          }
          renderItem={({ item, index }) => <GroupCard group={item} index={index} />}
        />
      );
    }

    if (activeTab === 'peers') {
      return (
        <FlatList 
          data={peers}
          keyExtractor={p => p.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120, paddingHorizontal: 24 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.feedHeaderRow}>
              <Text style={styles.sectionTitle}>Peer Supporters</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.plum + '15' }]}>
                <Users color={theme.colors.plum} size={32} />
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No peer supporters available yet.</Text>
            </View>
          }
          renderItem={({ item, index }) => <PeerCard peer={item} index={index} />}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <LinearGradient 
        colors={theme.isDark 
          ? ['rgba(216, 164, 143, 0.15)', theme.colors.background, theme.colors.backgroundSecondary]
          : ['rgba(216, 164, 143, 0.05)', theme.colors.background, theme.colors.backgroundSecondary]
        } 
        locations={[0, 0.2, 1]}
        style={StyleSheet.absoluteFillObject} 
      />

      <View style={{ paddingTop: insets.top + 20 }}>
        <ScreenHeader 
          title="Safe Space" 
          subtitle="Connect, share, and find support"
          rightAction={
            <TouchableOpacity 
              style={styles.searchBtn}
              onPress={() => Alert.alert('Search', 'Community search will be available soon!')}
            >
              <Search color={theme.colors.accents.gentlePeach} size={24} />
            </TouchableOpacity>
          }
        />

        {/* Segmented Control Tabs */}
        <View style={styles.tabContainer}>
          {[
            { id: 'discussions', label: 'Discussions' },
            { id: 'groups', label: 'Groups' },
            { id: 'peers', label: 'Peers' }
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && { backgroundColor: theme.colors.plum }]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <Text style={[
                styles.tabText, 
                activeTab === tab.id ? { color: '#FFF' } : { color: theme.colors.text.secondary }
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* FAB (Only for Discussions) */}
      {activeTab === 'discussions' && (
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.fabContainer, { bottom: insets.bottom + 100 }]}>
          <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setIsCreateVisible(true)}>
            <PenSquare color={theme.colors.text.onPrimary || '#FFF'} size={24} />
            <Text style={styles.fabText}>{t('community.share_thought') || 'Start a Discussion'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Create Post Modal */}
      <Modal
        visible={isCreateVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('community.share_thought') || 'Start a Discussion'}</Text>
              <TouchableOpacity onPress={() => setIsCreateVisible(false)} style={styles.closeBtn}>
                <X color={theme.colors.plum} size={18} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Support Group</Text>
            <View style={styles.pickerRow}>
              {groups.map((g: any) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.pickerChip,
                    selectedGroup === g.name && { backgroundColor: theme.colors.plum, borderColor: theme.colors.plum }
                  ]}
                  onPress={() => setSelectedGroup(g.name)}
                >
                  <Text style={[
                    styles.pickerChipText,
                    { color: selectedGroup === g.name ? '#FFF' : theme.colors.text.secondary }
                  ]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.composerHeader}>
              <Text style={styles.modalLabel}>Your Message</Text>
              <Text style={[styles.charCount, postContent.length > 250 && { color: theme.colors.semantic.danger }]}>
                {postContent.length}/300
              </Text>
            </View>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text.primary, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
              placeholder="What's on your mind? Sharing anonymously can help relieve stress..."
              placeholderTextColor={theme.colors.text.disabled}
              multiline
              maxLength={300}
              numberOfLines={6}
              value={postContent}
              onChangeText={setPostContent}
            />

            <TouchableOpacity 
              style={[styles.publishBtn, (!postContent.trim() || publishing) && { opacity: 0.6 }]} 
              onPress={handleCreatePost}
              disabled={!postContent.trim() || publishing}
            >
              {publishing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <PenSquare color="#FFF" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.publishBtnText}>Publish Anonymously</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 0 },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  
  // Tab Segments
  tabContainer: { flexDirection: 'row', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 20, marginHorizontal: 24, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, fontFamily: theme.typography.fonts.header, fontWeight: '700' },
  
  feedHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: -0.5 },
  filterToggle: { flexDirection: 'row', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 20, padding: 4 },
  filterToggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  filterToggleText: { fontSize: 13, fontFamily: theme.typography.fonts.accent, fontWeight: '700', color: theme.colors.text.secondary },

  // Posts
  postCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: theme.isDark ? 0.2 : 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  postAuthorInfo: { flexDirection: 'row', alignItems: 'center' },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  postGroup: { fontSize: 15, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 2 },
  postTime: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.tertiary },
  moreBtn: { padding: 4 },
  postContent: { fontSize: 16, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, lineHeight: 24, marginBottom: 20 },
  postActions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', paddingTop: 16, gap: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 14, fontFamily: theme.typography.fonts.accent, fontWeight: '600', color: theme.colors.text.secondary },

  // Groups
  groupListCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  groupListHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  groupListIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groupListInfo: { flex: 1 },
  groupListTitle: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 4 },
  groupListMembers: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  joinBtnText: { color: '#FFF', fontSize: 13, fontFamily: theme.typography.fonts.header, fontWeight: '700' },
  groupListDesc: { fontSize: 14, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, lineHeight: 20 },

  // Peers
  peerCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  peerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  peerAvatarWrap: { position: 'relative', marginRight: 16 },
  peerAvatarPlaceholder: { width: 56, height: 56, borderRadius: 28 },
  peerOnlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: theme.colors.surface },
  peerInfo: { flex: 1 },
  peerNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  peerName: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.primary },
  peerRatingRow: { flexDirection: 'row', alignItems: 'center' },
  peerRating: { fontSize: 13, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, marginLeft: 4 },
  msgBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, gap: 6 },
  msgBtnText: { color: '#FFF', fontSize: 13, fontFamily: theme.typography.fonts.header, fontWeight: '700' },
  peerBio: { fontSize: 14, fontFamily: theme.typography.fonts.body, color: theme.colors.text.secondary, lineHeight: 22, marginBottom: 16 },
  peerSpecialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  specChipText: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '600', color: theme.colors.text.primary },

  // FAB
  fabContainer: { position: 'absolute', right: 24 },
  fab: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.plum, paddingHorizontal: 20, height: 56, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: theme.isDark ? 0.3 : 0.2, shadowRadius: 16, elevation: 8, gap: 8 },
  fabText: { fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '700', color: theme.colors.text.onPrimary || '#FFF' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { height: '70%', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: theme.typography.fonts.header, fontWeight: '800', color: theme.colors.text.primary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  modalLabel: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.text.tertiary, marginBottom: 10, marginTop: 10 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pickerChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
  pickerChipText: { fontSize: 13, fontFamily: theme.typography.fonts.accent, fontWeight: '600' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.ui,
    textAlign: 'center',
  },
  modalInput: { borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 15, fontFamily: theme.typography.fonts.body, lineHeight: 22, height: 120, textAlignVertical: 'top', marginBottom: 24, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
  publishBtn: { flexDirection: 'row', backgroundColor: '#7B61FF', paddingVertical: 16, borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishBtnText: { color: '#FFF', fontSize: 16, fontFamily: theme.typography.fonts.header, fontWeight: '800' },
  composerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 10 },
  charCount: { fontSize: 12, fontFamily: theme.typography.fonts.accent, fontWeight: '600', color: theme.colors.text.tertiary }
});
