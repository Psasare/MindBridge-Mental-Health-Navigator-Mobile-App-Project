import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  StatusBar,
  Alert,
  Dimensions,
  Pressable
} from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import api from '../../src/services/api';
import { 
  Phone, 
  Building2,
  PhoneForwarded,
  MapPin,
  ChevronRight,
  Stethoscope,
  Users,
  BriefcaseMedical,
  Mail,
  Globe,
  ShieldAlert,
  Info
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const UNIVERSITY_COUNSELING_CENTERS: Record<string, any> = {
  'Kwame Nkrumah University of Science and Technology (KNUST)': {
    name: 'KNUST Counselling Center',
    number: '+233 50 644 9747',
    secondaryNumber: '+233 59 439 9777',
    email: 'counsellingcentre@gmail.com',
    description: 'Professional support for students & staff',
    address: 'J. Harper Building, Room 7B, Campus',
    services: ['Mental Health Support', 'Academic Counselling', 'Career Development']
  },
  'University of Ghana (UG)': {
    name: 'UG Careers & Counselling Centre',
    number: '+233 24 594 5752',
    secondaryNumber: '+233 20 499 9221',
    email: 'careers@st.ug.edu.gh',
    website: 'UG Careers & Counselling Services',
    description: 'Confidential psychological support',
    address: 'Legon Campus',
    services: [
      'Mental Health & Psycho-social Support',
      'Academic Counselling',
      'Career Development',
      'Psychiatric assessment'
    ]
  },
  'University of Cape Coast (UCC)': {
    name: 'UCC Counselling Centre',
    number: '+233 33 213 2440',
    email: 'focansey@ucc.edu.gh',
    description: 'Mental health and career guidance services',
    address: 'North Campus, Cape Coast',
    services: ['Mental Health Support', 'Academic Guidance', 'Career Counselling']
  },
  'University of Education, Winneba (UEW)': {
    name: 'UEW Counselling Centre',
    number: '+233 24 317 0085',
    secondaryNumber: '+233 24 768 6494',
    email: 'counselling@uew.edu.gh',
    description: 'Holistic counselling for the university community',
    address: 'Student Centre, First Floor, North Campus',
    services: ['Personal Counselling', 'Academic Support']
  },
  'University for Development Studies (UDS)': {
    name: 'UDS Career Mentorship & Support',
    number: '+233 37 209 3697',
    secondaryNumber: '+233 54 544 7445',
    email: 'registrar@uds.edu.gh',
    description: 'Student support and career guidance',
    address: 'Tamale Campus',
    services: ['Career Counselling', 'General Support']
  },
  'Ashesi University': {
    name: 'Ashesi Counselling Center',
    number: '+233 30 261 0330',
    secondaryNumber: '+233 24 880 7992',
    email: 'ddavis@ashesi.edu.gh',
    website: 'ashesicounsellingandcoachingcenter.simplybook.me',
    description: 'Holistic support for Ashesi students',
    address: 'Berekuso Campus',
    services: ['Emotional Support', 'Academic Coaching', 'Career Guidance']
  },
  'Academic City University College': {
    name: 'ACity Career Services',
    number: '+233 59 403 0308',
    email: 'careerservices@acity.edu.gh',
    description: 'Wellness and career counseling for ACity students',
    address: 'Haatso, Accra',
    services: ['Career Counselling', 'Student Wellness']
  },
  'University of Professional Studies, Accra (UPSA)': {
    name: 'UPSA Counselling Unit',
    number: '+233 30 395 8571',
    description: 'Professional guidance and counseling unit',
    address: 'Student Services, Legon, Accra',
    services: ['Academic Counselling', 'Career Guidance', 'Personal Counselling']
  },
  'GIMPA': {
    name: 'GIMPA Counselling Unit',
    number: '+233 30 240 1681',
    email: 'gcu@gimpa.edu.gh',
    website: 'scheduler.gimpa.edu.gh/ea',
    description: 'Support for the GIMPA community',
    address: 'Greenhill, Accra',
    services: ['Individual Counselling', 'Group Counselling', 'Mental Consultations']
  },
  'Other': {
    name: 'National Counseling Center',
    number: '0800 678 678',
    description: 'General institutional support',
    address: 'Nationwide',
    services: ['General Support', 'Mental Health Referrals']
  }
};

const PulsingCallButton = ({ title, subtitle, number, color, icon: Icon, delay, secondary, styles, theme }: any) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    if (!secondary) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const handleCall = async () => {
    try {
      const url = `tel:${number.replace(/\s+/g, '')}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Unavailable', 'Your device does not support calling.');
    } catch (error) {
      console.warn('Error opening dialer:', error);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)}>
      <Pressable onPress={handleCall} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[
          styles.callButton, 
          secondary ? [styles.callButtonSecondary, { borderColor: color + '50' }] : styles.callButtonPrimary,
          !secondary && pulseStyle,
          animatedStyle
        ]}>
          <LinearGradient
            colors={secondary ? ['transparent', 'transparent'] : [color, color + 'E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
          />
          {!secondary && (
            <BlurView intensity={20} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 28, overflow: 'hidden' }]} />
          )}
          
          <View style={styles.callButtonContent}>
            <View style={[styles.callIconWrap, secondary ? { backgroundColor: color + '15' } : { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Icon color={secondary ? color : '#FFF'} size={28} />
            </View>
            <View style={styles.callTextWrap}>
              <Text style={[styles.callTitle, { color: secondary ? color : '#FFF' }]}>{title}</Text>
              <Text style={[styles.callSubtitle, { color: secondary ? color + '90' : 'rgba(255,255,255,0.85)' }]}>{subtitle}</Text>
            </View>
            <ChevronRight color={secondary ? color + '50' : 'rgba(255,255,255,0.6)'} size={24} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default function CrisisSupportScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { userData } = useContext(AuthContext);
  const styles = createStyles(theme);
  
  const initialUni = userData?.academic?.institution || 'Other';
  const [userUni, setUserUni] = useState<string>(initialUni);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data?.onboarding?.university) {
          setUserUni(response.data.onboarding.university);
        }
      } catch (error) {
        // Fallback handled
      }
    };
    fetchProfile();
  }, []);
  
  const getInstitutionDetails = (uniName: string) => {
    if (UNIVERSITY_COUNSELING_CENTERS[uniName]) return UNIVERSITY_COUNSELING_CENTERS[uniName];
    if (uniName === 'Other') return UNIVERSITY_COUNSELING_CENTERS['Other'];
    return {
      name: `${uniName} Counseling`,
      number: '0800 678 678', 
      description: 'Contact your local student affairs office.',
      address: 'Campus Administration',
      services: ['Mental Health Support', 'General Counseling', 'Crisis Management']
    };
  };

  const institution = getInstitutionDetails(userUni);

  const NEARBY_SERVICES = [
    {
      id: 'therapy',
      title: 'Therapy Clinics',
      description: 'Find licensed psychologists near you',
      icon: Stethoscope,
      query: 'therapy+clinics+near+me',
      color: theme.colors.ocean,
    },
    {
      id: 'hospital',
      title: 'Mental Health Facilities',
      description: 'Psychiatric and intensive care units',
      icon: BriefcaseMedical,
      query: 'psychiatric+hospital+near+me',
      color: theme.colors.plum,
    },
    {
      id: 'support',
      title: 'Support Groups',
      description: 'Community peer support and therapy',
      icon: Users,
      query: 'mental+health+support+groups+near+me',
      color: theme.colors.accents.mossVelvet,
    }
  ];

  const handleMap = async (query: string) => {
    try {
      const url = `https://www.google.com/maps/search/${query}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Map Unavailable', 'Unable to open maps.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
          <View style={[styles.headerBadge, { backgroundColor: theme.colors.semantic.danger + '15' }]}>
            <ShieldAlert color={theme.colors.semantic.danger} size={16} />
            <Text style={[styles.headerBadgeText, { color: theme.colors.semantic.danger }]}>Emergency & Crisis</Text>
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Get Help Now</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
            You are not alone. Immediate support is available 24/7.
          </Text>
        </Animated.View>

        {/* Primary Actions (Highly Prominent) */}
        <View style={styles.actionsContainer}>
          <PulsingCallButton 
            title={institution.name} 
            subtitle="Campus Support Line"
            number={institution.number}
            color={theme.colors.plum}
            icon={Phone}
            delay={100}
            styles={styles}
            theme={theme}
          />

          {institution.secondaryNumber && (
            <PulsingCallButton 
              title="Secondary Helpline" 
              subtitle="Alternative Campus Contact"
              number={institution.secondaryNumber}
              color={theme.colors.text.primary}
              icon={PhoneForwarded}
              delay={200}
              secondary
              styles={styles}
              theme={theme}
            />
          )}

          <PulsingCallButton 
            title="National Emergency" 
            subtitle="Police, Fire, Ambulance (112)"
            number="112"
            color={theme.colors.semantic.danger}
            icon={ShieldAlert}
            delay={300}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Institutional Information (Cleaner, Flat Design) */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Institution Details</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.colors.plum + '15' }]}>
                <Building2 color={theme.colors.plum} size={22} />
              </View>
              <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>{institution.description}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRows}>
              {institution.address && (
                <View style={styles.infoRow}>
                  <MapPin size={18} color={theme.colors.text.tertiary} />
                  <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>{institution.address}</Text>
                </View>
              )}
              {institution.email && (
                <View style={styles.infoRow}>
                  <Mail size={18} color={theme.colors.text.tertiary} />
                  <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>{institution.email}</Text>
                </View>
              )}
              {institution.website && (
                <View style={styles.infoRow}>
                  <Globe size={18} color={theme.colors.text.tertiary} />
                  <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>{institution.website}</Text>
                </View>
              )}
            </View>

            {institution.services && (
              <View style={styles.servicesContainer}>
                <View style={styles.servicesHeader}>
                  <Info size={16} color={theme.colors.text.tertiary} />
                  <Text style={[styles.servicesTitle, { color: theme.colors.text.tertiary }]}>Available Services</Text>
                </View>
                <View style={styles.servicesChips}>
                  {institution.services.map((service: string, idx: number) => (
                    <View key={idx} style={[styles.serviceChip, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.background, borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
                      <Text style={[styles.serviceChipText, { color: theme.colors.text.secondary }]}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Nearby Services (Horizontal List to save space and look cleaner) */}
        <Animated.View entering={FadeInUp.delay(500).duration(800)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Nearby Services</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }} snapToInterval={width * 0.75 + 16} decelerationRate="fast">
            {NEARBY_SERVICES.map((service, index) => (
              <Pressable key={service.id} onPress={() => handleMap(service.query)}>
                <Animated.View style={[
                  styles.nearbyCard, 
                  { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                ]}>
                  <View style={[styles.nearbyIconWrap, { backgroundColor: service.color + '15' }]}>
                    <service.icon color={service.color} size={24} />
                  </View>
                  <Text style={[styles.nearbyTitle, { color: theme.colors.text.primary }]}>{service.title}</Text>
                  <Text style={[styles.nearbyDesc, { color: theme.colors.text.secondary }]}>{service.description}</Text>
                  
                  <View style={styles.nearbyActionRow}>
                    <Text style={[styles.nearbyActionText, { color: service.color }]}>Find on Map</Text>
                    <ChevronRight color={service.color} size={16} />
                  </View>
                </Animated.View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 16,
    gap: 8,
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  callButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: theme.isDark ? 0 : 0.1,
    shadowRadius: 20,
    elevation: theme.isDark ? 0 : 10,
  },
  callButtonPrimary: {
    height: 110,
  },
  callButtonSecondary: {
    height: 90,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  callButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  callIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  callTextWrap: {
    flex: 1,
  },
  callTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 4,
  },
  callSubtitle: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  infoCard: {
    marginHorizontal: 24,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 20,
    elevation: theme.isDark ? 0 : 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
    lineHeight: 24,
  },
  infoDivider: {
    height: 1,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginVertical: 24,
  },
  infoRows: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '500',
  },
  servicesContainer: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  servicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.accent,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  servicesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  serviceChipText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
  },
  nearbyCard: {
    width: width * 0.75,
    marginLeft: 24,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 20,
    elevation: theme.isDark ? 0 : 5,
  },
  nearbyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nearbyTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginBottom: 8,
  },
  nearbyDesc: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.body,
    lineHeight: 22,
    marginBottom: 24,
  },
  nearbyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  nearbyActionText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.header,
    fontWeight: '800',
    marginRight: 8,
  }
});
