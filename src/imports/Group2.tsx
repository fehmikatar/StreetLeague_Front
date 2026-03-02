export default function Group() {
  return (
    <div className="leading-[normal] not-italic relative size-full text-black">
      <p className="absolute font-['Poppins:Bold',sans-serif] h-[40px] left-0 text-[36px] top-0 w-[243px] whitespace-pre-wrap">Heading H1</p>
      <p className="absolute font-['Poppins:SemiBold',sans-serif] left-0 text-[28px] top-[41px]">Heading H2</p>
      <p className="absolute font-['Poppins:SemiBold',sans-serif] left-0 text-[22px] top-[84px]">Heading H3</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-0 text-[16px] top-[118px]">{`Body Text `}</p>
      <p className="absolute font-['Inter:Light',sans-serif] font-light left-px text-[12px] top-[138px]">Small text</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-0 text-[16px] top-[154px]">Button text</p>
    </div>
  );
}