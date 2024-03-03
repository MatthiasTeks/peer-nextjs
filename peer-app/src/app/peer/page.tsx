// src/app/peer/peer.tsx
"use client"

import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
 
const PeerPage = () => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const callingVideoRef = useRef<HTMLVideoElement>(null);

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myUniqueId, setMyUniqueId] = useState<string>("");
  const [idToCall, setIdToCall] = useState('');

  const generateRandomString = () => Math.random().toString(36).substring(2);

  const handleCall = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }).then(stream => {
      const call = peerInstance?.call(idToCall, stream);
      if (call) {
        call.on('stream', userVideoStream => {
          console.log("4")
          if (callingVideoRef.current) {
            console.log("5")
            callingVideoRef.current.srcObject = userVideoStream;
          }
        });
      }
    });
  };

  useEffect(() => {
    if(myUniqueId){
        let peer: Peer;
        if (typeof window !== 'undefined') {
          peer = new Peer(myUniqueId, {
            host: 'localhost',
            port: 9000,
            path: '/myapp',
          });

          setPeerInstance(peer);
    
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          }).then(stream => {
            if (myVideoRef.current) {
              myVideoRef.current.srcObject = stream;
            }

            peer.on('call', call => {
              call.answer(stream);
              call.on('stream', userVideoStream => {
                if (callingVideoRef.current) {
                  callingVideoRef.current.srcObject = userVideoStream;
                }
              });
            });
          });
        }
        return () => {
            if (peer) {
              peer.destroy();
            }
          };
    }
  }, [myUniqueId]);

  useEffect(() => {
    setMyUniqueId(generateRandomString());
  }, [])

  return (
    <div className='flex flex-col justify-center items-center p-12'>
      <p>your id : {myUniqueId}</p>
      <video className='w-72' playsInline ref={myVideoRef} autoPlay />
      <input className='text-black' placeholder="Id to call" value={idToCall} onChange={e => setIdToCall(e.target.value)} />
      <button onClick={handleCall}>call</button>
      <video className='w-72' playsInline ref={callingVideoRef} autoPlay/>
    </div>
  );
};

export default PeerPage;