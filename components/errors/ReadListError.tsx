import lstring from "../../ts/localize"

const RestListError: React.FC<{ errmess?: string }> = (props) => {
  return <div>{lstring(props.errmess ? props.errmess : 'errorreadinglist')}</div>;
};

export default RestListError  
