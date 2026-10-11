export type Profile = {
  id: string; profileId?: string; name: string; age: number; city: string; state: string; profession: string; education: string;
  employmentStatus?: string;
  image: string; compatibility: number; verified?: boolean; online?: boolean; status?: string;
  about: string; height: string; maritalStatus: string; religion: string; motherTongue: string;
  family: string; lifestyle: string[]; interests: string[]; lookingFor: string;
  photos?: any[];
};

export const getProfileUniqueId = (profile?: { id?: string; profileId?: string } | null): string => {
  if (!profile) return 'MAT-10001';
  if (profile.profileId) {
    return profile.profileId.toUpperCase();
  }
  const demoIdMap: Record<string, string> = {
    ananya: 'MAT-92841',
    meera: 'MAT-89214',
    diya: 'MAT-86420',
    farah: 'MAT-84193',
    sana: 'MAT-81932',
    riya: 'MAT-79245',
  };
  const key = profile.id ? profile.id.toLowerCase() : '';
  if (demoIdMap[key]) {
    return demoIdMap[key];
  }
  if (profile.id) {
    if (profile.id.toUpperCase().startsWith('MAT-') || profile.id.toUpperCase().startsWith('LT-')) {
      return profile.id.toUpperCase();
    }
    const clean = profile.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length >= 6) {
      return `MAT-${clean.substring(0, 6)}`;
    }
    let hash = 0;
    for (let i = 0; i < profile.id.length; i++) {
      hash = (hash << 5) - hash + profile.id.charCodeAt(i);
      hash |= 0;
    }
    return `MAT-${Math.abs(hash % 90000) + 10000}`;
  }
  return 'MAT-10001';
};

export const profiles: Profile[] = [
  { id:'ananya', profileId:'MAT-92841', name:'Ananya Menon', age:27, city:'Kochi', state:'Kerala', profession:'Product Designer', education:'M.Des, NID', image:'https://i.pravatar.cc/800?u=ananya-menon', compatibility:92, verified:true, online:true, about:'Creative, grounded and close to family. I enjoy slow weekends, discovering new cafés and building things that make everyday life simpler.', height:"5'5\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Close-knit family based in Kochi.', lifestyle:['Non-smoker','Occasional travel','Vegetarian'], interests:['Design','Travel','Reading','Coffee'], lookingFor:'Someone kind, emotionally mature and comfortable building a partnership as equals.' },
  { id:'meera', profileId:'MAT-89214', name:'Meera Nair', age:26, city:'Thrissur', state:'Kerala', profession:'Software Engineer', education:'B.Tech Computer Science', image:'https://i.pravatar.cc/800?u=meera-nair', compatibility:89, verified:true, about:'Software engineer who loves family time, music and exploring new places. I value honest conversations and a calm home.', height:"5'4\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Family based in Thrissur.', lifestyle:['Non-smoker','Fitness','Travel'], interests:['Music','Photography','Cooking'], lookingFor:'A supportive, communicative partner with a positive outlook.' },
  { id:'diya', profileId:'MAT-86420', name:'Diya Krishnan', age:29, city:'Bengaluru', state:'Karnataka', profession:'Finance Manager', education:'MBA Finance', image:'https://i.pravatar.cc/800?u=diya-krishnan', compatibility:86, verified:true, about:'Finance professional with a curious mind and a soft spot for good food and long conversations.', height:"5'6\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Family with roots in Palakkad.', lifestyle:['Non-smoker','Social drinker','Travel'], interests:['Food','Books','Hiking'], lookingFor:'A thoughtful, independent person who values family and personal growth.' },
  { id:'farah', profileId:'MAT-84193', name:'Farah Rahman', age:28, city:'Calicut', state:'Kerala', profession:'Architect', education:'B.Arch', image:'https://i.pravatar.cc/800?u=farah-rahman', compatibility:84, verified:false, about:'Architect, weekend explorer and someone who believes the best relationships are built on friendship first.', height:"5'3\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Warm family based in Kozhikode.', lifestyle:['Non-smoker','Travel','Fitness'], interests:['Architecture','Art','Travel'], lookingFor:'A genuine, respectful partner who enjoys both adventure and quiet evenings.' },
  { id:'sana', profileId:'MAT-81932', name:'Sana Thomas', age:30, city:'Kottayam', state:'Kerala', profession:'HR Business Partner', education:'MBA HR', image:'https://i.pravatar.cc/800?u=sana-thomas', compatibility:81, verified:true, about:'People-focused HR professional. Family, empathy and personal growth are important to me.', height:"5'5\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Family based in Kottayam.', lifestyle:['Non-smoker','Yoga','Travel'], interests:['Wellness','Films','Cooking'], lookingFor:'Someone emotionally available, dependable and family-oriented.' },
  { id:'riya', profileId:'MAT-79245', name:'Riya Varma', age:27, city:'Chennai', state:'Tamil Nadu', profession:'Marketing Lead', education:'MBA Marketing', image:'https://i.pravatar.cc/800?u=riya-varma', compatibility:79, verified:true, about:'Marketing lead who loves storytelling, good food and meaningful friendships.', height:"5'4\"", maritalStatus:'Never married', religion:'Not specified', motherTongue:'Malayalam', family:'Family based in Chennai.', lifestyle:['Non-smoker','Travel','Pet friendly'], interests:['Branding','Dogs','Movies'], lookingFor:'A warm, ambitious and grounded person who enjoys building a life together.' },
];

export const receivedInterests = [profiles[1], profiles[4]];
export const sentInterests = [profiles[0], profiles[3]];

export const conversations = [
  { id:'1', profile:profiles[0], last:'That sounds lovely. I also enjoy quiet cafés.', time:'10:42 AM', unread:2, online:true },
  { id:'2', profile:profiles[1], last:'Would you like to continue this conversation this evening?', time:'Yesterday', unread:0, online:false },
  { id:'3', profile:profiles[2], last:'Thank you for sharing your profile details.', time:'Mon', unread:0, online:false },
];

export const notifications = [
  { id:'1', type:'interest', title:'Meera sent you an interest', text:'Your profiles look compatible. Take a look when you have a moment.', time:'12 min ago', unread:true, profile:profiles[1] },
  { id:'2', type:'match', title:'New match suggestion', text:'Diya has a 86% compatibility match with your preferences.', time:'2 hrs ago', unread:true, profile:profiles[2] },
  { id:'3', type:'message', title:'New message from Ananya', text:'That sounds lovely. I also enjoy quiet cafés.', time:'3 hrs ago', unread:false, profile:profiles[0] },
  { id:'4', type:'profile', title:'Complete your profile', text:'Adding your family details can help improve your matches.', time:'Yesterday', unread:false },
];
