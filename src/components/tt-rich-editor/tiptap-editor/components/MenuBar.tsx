import { memo } from "react";

import { Toolbar, ToolbarDivider } from "./ui/Toolbar";

import TableButton from "../components/controls/TableButton";
import AlignPopover from "./controls/AlignPopover";
import BoldButton from "./controls/BoldButton";
import BulletListButton from "./controls/BulletListButton";
import HeadingDropdown from "./controls/HeadingDropdown";
import ImageButton from "./controls/ImageButton2";
import InsertDropdown from "./controls/InsertDropdown";
import ItalicButton from "./controls/ItalicButton";
import LinkButton from "./controls/LinkButton";
import MoreMarkDropdown from "./controls/MoreMarkPopover";
import OrderedListButton from "./controls/OrderedList";
import RedoButton from "./controls/RedoButton";
import TextColorButton from "./controls/TextColorButton";
import TextHighlightButton from "./controls/TextHighlightButton";
import UnderlineButton from "./controls/UnderlineButton";
import UndoButton from "./controls/UndoButton";
import SeparatorDividerButton from "./controls/SeparatorDividerButton";
import BlockquoteButton from "./controls/BlockquoteButton";

const MenuBar = () => {
  return (
    <div className="rte-menu-bar">
      <Toolbar dense>
        <UndoButton />
        <RedoButton />
        {/* <ClearFormatButton /> */}

        <ToolbarDivider />

        <HeadingDropdown />

        <ToolbarDivider />

        <BoldButton />
        <ItalicButton />
        <UnderlineButton />
        <MoreMarkDropdown />

        <ToolbarDivider />

        <TextColorButton />
        <TextHighlightButton />

        <ToolbarDivider />

        <AlignPopover />
        <BulletListButton />
        <OrderedListButton />

        <ToolbarDivider />

        <BlockquoteButton />
        <SeparatorDividerButton />
        <LinkButton />
        <TableButton />
        <ImageButton />
        {/* <YoutubeButton /> */}
        {/* <CodeBlockButton /> */}
        <InsertDropdown />
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
