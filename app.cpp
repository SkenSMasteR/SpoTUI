#include <string>
#include <vector>

#include "ftxui/component/component.hpp"
#include "ftxui/component/component_options.hpp"
#include "ftxui/component/event.hpp"
#include "ftxui/component/screen_interactive.hpp"
#include "ftxui/dom/elements.hpp"
#include "ftxui/screen/color.hpp"

#ifdef _WIN32
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#ifdef RGB
#undef RGB
#endif
#endif

using namespace ftxui;

namespace {

const char* THEME_NAME = "SpoTUI";

const Color kOrangeLight = Color::RGB(255, 140, 66);
const Color kOrangeMid = Color::RGB(240, 131, 61);
const Color kOrangeDark = Color::RGB(224, 123, 57);
const Color kSelectFg = Color::RGB(0, 0, 0);
const Color kGreen = Color::RGB(140, 255, 140);
const Color kGray = Color::RGB(140, 140, 140);

const char* BLOCK_FULL = "\u2588";
const char* BLOCK_LOWER = "\u2584";
const char* BLOCK_UPPER = "\u2580";
const char* BLOCK_LEFT = "\u258c";

const std::vector<std::string> kHeaderTemplates = {
    "   BAAAAAAAA    BAAAAAAAB  BAAAAAAAB      AAA    AAA    AB   BA  ",
    "  AAA    AAA   AAA    AAA AAA    AAA CAAAAAAAAAB AAA    AAA AAA  ",
    "  AAA    AC    AAA    AAA AAA    AAA    CAAACCAA AAA    AAA AAAD ",
    "  AAA          AAA    AAA AAA    AAA     AAA   C AAA    AAA AAAD ",
    "CAAAAAAAAAAA CAAAAAAAAAC  AAA    AAA     AAA     AAA    AAA AAAD ",
    "         AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
    "   BA    AAA   AAA        AAA    AAA     AAA     AAA    AAA AAA  ",
    " BAAAAAAAAC   BAAAAC       CAAAAAAC     BAAAAC   AAAAAAAAC  AC   ",
};

Color gradient_color(int index, int total) {
    int r1 = 255, g1 = 140, b1 = 66;
    int r2 = 224, g2 = 123, b2 = 57;
    double t = (total <= 1) ? 0.0 : static_cast<double>(index) / (total - 1);
    int r = static_cast<int>(r1 + (r2 - r1) * t);
    int g = static_cast<int>(g1 + (g2 - g1) * t);
    int b = static_cast<int>(b1 + (b2 - b1) * t);
    return Color::RGB(r, g, b);
}

std::string ascii_art_line(const std::string& tpl) {
    std::string out;
    for (char c : tpl) {
        switch (c) {
            case 'A': out += BLOCK_FULL; break;
            case 'B': out += BLOCK_LOWER; break;
            case 'C': out += BLOCK_UPPER; break;
            case 'D': out += BLOCK_LEFT; break;
            default: out += c; break;
        }
    }
    return out;
}

Element logo() {
    Elements lines;
    int total = static_cast<int>(kHeaderTemplates.size());
    for (int i = 0; i < total; i++) {
        lines.push_back(text(ascii_art_line(kHeaderTemplates[i])) |
                        color(gradient_color(i, total)));
    }
    return vbox({
        vbox(std::move(lines)) | hcenter,
        text("Spicetify Theme Manager") | color(kOrangeMid) | bold | hcenter,
    });
}

}  // namespace

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif

    auto screen = ScreenInteractive::Fullscreen();

    std::vector<std::string> entries = {
        std::string("Install ") + THEME_NAME,
        std::string("Update ") + THEME_NAME,
        std::string("Uninstall ") + THEME_NAME,
        "Downgrade",
        "Check for Updates",
        "Exit",
    };
    int selected = 0;

    auto option = MenuOption::Vertical();
    option.entries_option.transform = [](EntryState state) {
        std::string prefix = state.active ? "> " : "  ";
        Element e = text(prefix + state.label);
        if (state.focused) {
            e = e | bgcolor(kOrangeLight) | color(kSelectFg) | bold;
        } else if (state.active) {
            e = e | color(kGreen) | bold;
        } else {
            e = e | color(Color::White);
        }
        return e;
    };
    option.on_enter = [&] {
        if (selected == static_cast<int>(entries.size()) - 1) {
            screen.ExitLoopClosure()();
        }
    };

    auto menu = Menu(&entries, &selected, option);

    auto renderer = Renderer(menu, [&] {
        return vbox({
                   logo(),
                   separator() | color(kOrangeDark),
                   menu->Render() | flex,
                   separator() | color(kOrangeDark),
                   text("Up/Down to move, Enter to select, Esc to exit") |
                       color(kGray) | hcenter,
               }) |
               border | color(kOrangeDark) | flex;
    });

    auto component = CatchEvent(renderer, [&](Event event) {
        if (event == Event::Escape) {
            screen.ExitLoopClosure()();
            return true;
        }
        return false;
    });

    screen.Loop(component);
    return 0;
}
