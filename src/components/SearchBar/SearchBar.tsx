import type { ChangeEvent } from "react";
import Styles from "./SearchBar.module.scss";

type SearchBarProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className={Styles.SearchBar}>
      <input
        type='search'
        aria-label='Search for smartphones'
        maxLength={100}
        autoComplete='off'
        placeholder='Search for smartphones...'
        value={value}
        onChange={onChange}
        className={Styles.SearchBar__input}
      />
    </div>
  );
};

export default SearchBar;
