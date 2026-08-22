"use client";
import { useEffect } from "react";
export function ProfileViewTracker({profileId}:{profileId:string}){useEffect(()=>{void fetch(`/api/v1/professionals/${profileId}/view`,{method:"POST",keepalive:true});},[profileId]);return null;}
