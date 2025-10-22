import Styles from "./SearchBar.module.scss";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className={Styles.SearchBar}>
      <input
        type='text'
        placeholder='Search for smartphones...'
        value={value}
        onChange={onChange}
        className={Styles.SearchBar__input}
      />
    </div>
  );
};

export default SearchBar;
