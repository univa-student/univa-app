export type ProfileType = "default" | "univa";

export interface StudentUniversity {
    id: number;
    externalId: string;
    regionCode: string | null;
    location: string | null;
    name: string | null;
    shortName: string | null;
    typeName: string | null;
    facultyName: string | null;
    groupCode: string | null;
    course: number | null;
    courseLabel: string | null;
}

export interface ProfileUser {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    email: string;
    avatarPath: string | null;
    emailVerifiedAt?: string | null;
    createdAt: string;
}

export interface StudentProfile {
    id: number | null;
    profileType: ProfileType;
    profileImage: string | null;
    bio: string | null;
    phone: string | null;
    telegram: string | null;
    city: string | null;
    birthDate: string | null;
    onlineStatus?: boolean | null;
    online_status?: boolean | null;
    user: ProfileUser | null;
    university: StudentUniversity | null;
    completion: {
        filled: number;
        total: number;
        percent: number;
    };
}

export interface ProfileOption<T extends string | number = string> {
    value: T;
    label: string;
}

export interface UniversityLookupItem {
    id: string;
    name: string;
    shortName: string | null;
    region: string | null;
}

export interface UniversityFaculty {
    name: string;
}

export interface UniversitySpeciality {
    code: string;
    name: string;
    degree: string | null;
}

export interface UniversityLookupDetails {
    id: string;
    name: string;
    shortName: string | null;
    typeName: string | null;
    nameEn: string | null;
    region: string | null;
    city: string | null;
    location: string | null;
    address: string | null;
    site: string | null;
    email: string | null;
    phone: string | null;
    faculties: UniversityFaculty[];
    specialities: UniversitySpeciality[];
}

export interface ProfileInformation {
    regions: ProfileOption[];
    courses: ProfileOption<number>[];
}

export interface UpdateStudentProfilePayload {
    bio?: string | null;
    phone?: string | null;
    telegram?: string | null;
    city?: string | null;
    birthDate?: string | null;
}

export interface SaveStudentUniversityPayload {
    universityId: string;
    regionCode: string;
    specialityName?: string | null;
    groupCode?: string | null;
    course: number;
}

export interface ProfileViewModel {
    profile: StudentProfile;
    isForeignProfile: boolean;
    isOwnProfile: boolean;
    userName: string;
    avatarUrl: string;
    email: string;
    about: string;
    cityLabel: string;
    telegramUrl: string | null;
    onlineStatus: boolean | null;
}
