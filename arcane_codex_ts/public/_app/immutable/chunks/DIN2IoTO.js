import{c as U,a as o,f as v}from"./DmY1WVrf.js";import"./39cS-JjE.js";import{h as H,c as e,r,b as P,t as d}from"./BXw_DALN.js";import{I as S,b as q,s as p,c as w}from"./cHulNqf8.js";import{l as B,s as D,p as i,i as y}from"./ysmZaXG2.js";import{s as E}from"./DgWjOOEg.js";function W(f,a){const l=B(a,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.511.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */const m=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["circle",{cx:"9",cy:"7",r:"4"}]];S(f,D({name:"users"},()=>l,{get iconNode(){return m},children:(g,u)=>{var n=U(),h=H(n);q(h,a,"default",{}),o(g,n)},$$slots:{default:!0}}))}var F=v('<img class="object-cover"/>'),G=v('<div class="bg-arcane-surface flex items-center justify-center w-full h-full"><span class="font-heading text-arcane-gold uppercase"> </span></div>'),J=v("<div></div>"),K=v('<div><div class="avatar"><div><!></div></div> <!></div>');function X(f,a){let l=i(a,"src",3,""),m=i(a,"alt",3,""),g=i(a,"initials",3,""),u=i(a,"size",3,"md"),n=i(a,"class",3,"");const h={sm:"w-8 h-8 text-xs",md:"w-12 h-12 text-sm",lg:"w-16 h-16 text-lg",xl:"w-24 h-24 text-2xl"},z={online:"bg-green-500",offline:"bg-gray-500",away:"bg-arcane-gold",busy:"bg-arcane-crimson"},M={sm:"w-2 h-2",md:"w-3 h-3",lg:"w-4 h-4",xl:"w-5 h-5"};var c=K(),_=e(c),b=e(_),N=e(b);{var j=s=>{var t=F();d(()=>{w(t,"src",l()),w(t,"alt",m())}),o(s,t)},k=s=>{var t=G(),x=e(t),I=e(x,!0);r(x),r(t),d(()=>E(I,g()||"?")),o(s,t)};y(N,s=>{l()?s(j):s(k,!1)})}r(b),r(_);var A=P(_,2);{var C=s=>{var t=J();d(()=>p(t,1,`absolute bottom-0 right-0 rounded-full border-2 border-arcane-void ${z[a.status]??""} ${M[u()]??""}`)),o(s,t)};y(A,s=>{a.status&&s(C)})}r(c),d(()=>{p(c,1,`relative inline-block ${n()??""}`),p(b,1,`rounded-full ring ring-arcane-gold/30 ring-offset-2 ring-offset-arcane-void ${h[u()]??""}`)}),o(f,c)}export{X as A,W as U};
