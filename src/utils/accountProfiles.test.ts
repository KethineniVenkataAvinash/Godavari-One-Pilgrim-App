import {test} from 'node:test';
import assert from 'node:assert/strict';
import {archiveProfile,restoreProfile} from './accountProfiles';
test('account profiles stay separate and restoring a profile does not authenticate it',()=>{
 const items=new Map<string,string>();const storage={setItem:(k:string,v:string)=>items.set(k,v),getItem:(k:string)=>items.get(k)??null};
 archiveProfile(storage,{phone:'9000000001',isLoggedIn:true,name:'First',photoUrl:'photo-one'});
 archiveProfile(storage,{phone:'9000000002',isLoggedIn:true,name:'Second',photoUrl:'photo-two'});
 assert.deepEqual(restoreProfile(storage,'9000000001'),{phone:'9000000001',isLoggedIn:false,name:'First',photoUrl:'photo-one'});
 assert.equal((restoreProfile<any>(storage,'9000000002')).photoUrl,'photo-two');
 assert.deepEqual(restoreProfile(storage,'9000000003'),{});
 archiveProfile(storage,{phone:'9000000001',isLoggedIn:false,name:'Guest'});
 assert.equal((restoreProfile<any>(storage,'9000000001')).name,'First');
});
