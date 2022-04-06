const InLine = (props: any) => {
  const script = document.createElement('script');

  script.innerHTML = props.js;
  script.async = true;

  document.body.appendChild(script);
  document.body.removeChild(script);

  return null;
};

export default InLine;
