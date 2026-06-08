/**
 * The code exports two hooks, useAppDispatch and useAppSelector, for using the Redux store in a
 * TypeScript React application.
 */

import { AppDispatch } from "./types";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/types";

export const useAppDispatch: () => AppDispatch = () =>
  useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
