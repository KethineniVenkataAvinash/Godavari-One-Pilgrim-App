export type StoredProfile = {phone:string;isLoggedIn:boolean;[key:string]:unknown};
const key=(phone:string)=>`g1_account_profile_${phone.replace(/\D/g,'')}`;
export function archiveProfile(storage:Pick<Storage,'setItem'>,profile:StoredProfile){
  if(profile.phone&&profile.isLoggedIn) storage.setItem(key(profile.phone),JSON.stringify({...profile,isLoggedIn:false}));
}
export function restoreProfile<T>(storage:Pick<Storage,'getItem'>,phone:string):Partial<T>{
  const raw=storage.getItem(key(phone));if(!raw)return {};
  const profile=JSON.parse(raw);
  if(!profile||typeof profile!=='object'||profile.phone?.replace(/\D/g,'')!==phone.replace(/\D/g,''))return {};
  return profile;
}
