import {useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Category} from '../model/Category';
import {setCategories} from '../redux/slices/categorySlice';

export const useCategory = () => {
  const isFirst = useRef(true);
  const {categories} = useAppSelector(state => state.category);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('hook:useCategory');
    if (categories.length === 0 && isFirst.current) {
      console.log('hook:useCategory filtered');
      isFirst.current = false;
      Category.getAll()
        .then(c => dispatch(setCategories(c.map(_ => _.toJSON()))))
        .catch(() => {
          isFirst.current = true;
        });
    }
  }, [categories, dispatch]);
  return {categories};
};
