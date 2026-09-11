// Linux - g++ -std=c++17 -O2 -o spotui app.cpp

// Windows - x86_64-w64-mingw32-g++ -std=c++17 -O2 -static -o spotui.exe app.cpp

// CMake - cmake -B build && cmake --build build


#include <algorithm>
#include <cctype>
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#ifdef _WIN32
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#include <conio.h>
#else
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#endif

namespace {

const char* THEME_NAME = "SpoTUI";

const char* BLOCK_FULL = "\u2588";
const char* BLOCK_LOWER = "\u2584";
const char* BLOCK_UPPER = "\u2580";
const char* BLOCK_LEFT = "\u258c";

std::string rgb_code(int r, int g, int b) {
    return "\x1b[38;2;" + std::to_string(r) + ";" + std::to_string(g) + ";" +
           std::to_string(b) + "m";
}

std::string esc(int n) {
    return "\x1b[" + std::to_string(n) + "m";
}

const std::string RESET = esc(0);
const std::string WHITE = esc(97);
const std::string GRAY = esc(90);
const std::string RED = esc(91);
const std::string GREEN = esc(92);
const std::string CYAN = esc(96);
const std::string ORANGE_LIGHT = rgb_code(255, 140, 66);
const std::string ORANGE_DARK = rgb_code(224, 123, 57);
const std::string ORANGE_MID = rgb_code(240, 131, 61);
const std::string GREEN_ANSI = rgb_code(140, 255, 140);
const std::string SELECT_BG =
    "\x1b[48;2;255;140;66m\x1b[38;2;0;0;0m";

bool g_vt_enabled = true;

void enable_vt() {
#ifdef _WIN32
    HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
    DWORD mode = 0;
    if (h != INVALID_HANDLE_VALUE && GetConsoleMode(h, &mode)) {
        if (SetConsoleMode(h, mode | 0x0004)) {
            g_vt_enabled = true;
        } else {
            g_vt_enabled = false;
        }
    }
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#else
    g_vt_enabled = true;
#endif
}

std::string gradient_color(int index, int total) {
    int r1 = 255, g1 = 140, b1 = 66;
    int r2 = 224, g2 = 123, b2 = 57;
    double t = (total <= 1) ? 0.0 : static_cast<double>(index) / (total - 1);
    int r = static_cast<int>(r1 + (r2 - r1) * t);
    int g = static_cast<int>(g1 + (g2 - g1) * t);
    int b = static_cast<int>(b1 + (b2 - b1) * t);
    return rgb_code(r, g, b);
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

std::vector<std::string> header_lines() {
    std::vector<std::string> lines;
    lines.emplace_back("");
    int total = static_cast<int>(kHeaderTemplates.size());
    for (int i = 0; i < total; i++) {
        lines.push_back(gradient_color(i, total) +
                        ascii_art_line(kHeaderTemplates[i]) + RESET);
    }
    lines.emplace_back("");
    lines.push_back(ORANGE_MID + "                     Spicetify Theme Manager" + RESET);
    lines.push_back(ORANGE_DARK +
                    "  =============================================================" + RESET);
    lines.emplace_back("");
    return lines;
}

std::string trim(const std::string& s) {
    std::string r = s;
    while (!r.empty() && (r.back() == '\n' || r.back() == '\r' || r.back() == ' '))
        r.pop_back();
    return r;
}

std::vector<std::string> split(const std::string& s, char delim) {
    std::vector<std::string> parts;
    std::string cur;
    std::istringstream ss(s);
    while (std::getline(ss, cur, delim)) parts.push_back(cur);
    return parts;
}

size_t visible_length(const std::string& s) {
    size_t len = 0;
    for (size_t i = 0; i < s.size(); i++) {
        if (s[i] == '\x1b') {
            while (i < s.size() && s[i] != 'm') i++;
        } else {
            unsigned char c = static_cast<unsigned char>(s[i]);
            if ((c & 0xC0) != 0x80) len++;
        }
    }
    return len;
}

void clear_screen() {
#ifdef _WIN32
    HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
    CONSOLE_SCREEN_BUFFER_INFO info;
    if (g_vt_enabled) {
        std::cout << "\x1b[2J\x1b[H";
    } else if (GetConsoleScreenBufferInfo(h, &info)) {
        COORD top = {0, 0};
        DWORD n;
        DWORD cells = info.dwSize.X * info.dwSize.Y;
        FillConsoleOutputCharacterW(h, L' ', cells, top, &n);
        SetConsoleCursorPosition(h, top);
    }
#else
    std::cout << "\x1b[2J\x1b[H";
#endif
    std::cout.flush();
}

int console_width() {
#ifdef _WIN32
    if (g_vt_enabled) {
        CONSOLE_SCREEN_BUFFER_INFO info;
        if (GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &info))
            return info.srWindow.Right - info.srWindow.Left + 1;
    }
#else
    struct winsize w;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0 && w.ws_col > 0)
        return w.ws_col;
#endif
    return 80;
}

int console_height() {
#ifdef _WIN32
    if (g_vt_enabled) {
        CONSOLE_SCREEN_BUFFER_INFO info;
        if (GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &info))
            return info.srWindow.Bottom - info.srWindow.Top + 1;
    }
#else
    struct winsize w;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0 && w.ws_row > 0)
        return w.ws_row;
#endif
    return 30;
}

void write_frame(const std::vector<std::string>& frame) {
    std::cout << "\x1b[H";
    int width = console_width();
    for (const auto& line : frame) {
        size_t vis = visible_length(line);
        int pad = width - static_cast<int>(vis) - 1;
        if (pad < 0) pad = 0;
        std::cout << line << std::string(pad, ' ') << "\n";
    }
    std::cout.flush();
}

void show_header() {
    clear_screen();
    for (const auto& line : header_lines()) std::cout << line << "\n";
    std::cout.flush();
}

int run_cmd(const std::string& cmd) {
    int rc = std::system(cmd.c_str());
#ifdef _WIN32
    return rc;
#else
    return rc == -1 ? -1 : WEXITSTATUS(rc);
#endif
}

std::string run_capture(const std::string& cmd) {
    std::string out;
#ifdef _WIN32
    FILE* pipe = _popen(cmd.c_str(), "r");
#else
    FILE* pipe = popen(cmd.c_str(), "r");
#endif
    if (!pipe) return out;
    char buf[4096];
    size_t n;
    while ((n = fread(buf, 1, sizeof(buf), pipe)) > 0) out.append(buf, n);
#ifdef _WIN32
    _pclose(pipe);
#else
    pclose(pipe);
#endif
    return out;
}

int get_ch() {
#ifdef _WIN32
    return _getch();
#else
    struct termios oldt, newt;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    char c;
    ssize_t n = read(STDIN_FILENO, &c, 1);
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    if (n != 1) return EOF;
    return static_cast<unsigned char>(c);
#endif
}

void wait_key() {
#ifdef _WIN32
    _getch();
#else
    get_ch();
#endif
}

std::string read_key() {
#ifdef _WIN32
    int ch = _getch();
    if (ch == 0 || ch == 224) {
        int sc = _getch();
        if (sc == 72) return "UP";
        if (sc == 80) return "DOWN";
        return "OTHER";
    }
    if (ch == '\r' || ch == '\n') return "ENTER";
    if (ch == 27) {
        if (_kbhit()) {
            int c1 = _getch();
            if (c1 == '[' || c1 == 'O') {
                int c2 = _getch();
                if (c2 == 'A') return "UP";
                if (c2 == 'B') return "DOWN";
            }
        }
        return "ESC";
    }
    return "OTHER";
#else
    int ch = get_ch();
    if (ch == '\n' || ch == '\r') return "ENTER";
    if (ch == 27) {
        struct termios oldt, newt;
        tcgetattr(STDIN_FILENO, &oldt);
        newt = oldt;
        newt.c_lflag &= ~(ICANON | ECHO);
        newt.c_cc[VMIN] = 0;
        newt.c_cc[VTIME] = 0;
        tcsetattr(STDIN_FILENO, TCSANOW, &newt);
        int c1 = EOF, c2 = EOF;
        char buf;
        if (read(STDIN_FILENO, &buf, 1) == 1) c1 = buf;
        if (c1 != EOF && read(STDIN_FILENO, &buf, 1) == 1) c2 = buf;
        tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
        if (c1 == '[' || c1 == 'O') {
            if (c2 == 'A') return "UP";
            if (c2 == 'B') return "DOWN";
        }
        return "ESC";
    }
    return "OTHER";
#endif
}

bool read_confirm(const char* prompt, const char* yes_char) {
    std::cout << "  " << prompt << ": ";
    std::cout.flush();
    std::string line;
    std::getline(std::cin, line);
    if (line.empty()) {
        int ch = get_ch();
        std::cout << static_cast<char>(ch) << "\n";
        char c = static_cast<char>(ch);
        return c == yes_char[0] || c == std::toupper(yes_char[0]);
    }
    std::string up = line;
    std::transform(up.begin(), up.end(), up.begin(), ::tolower);
    std::string low_yes = yes_char;
    std::transform(low_yes.begin(), low_yes.end(), low_yes.begin(), ::tolower);
    return up == low_yes;
}

std::string get_env(const char* name) {
    const char* v = std::getenv(name);
    return v ? std::string(v) : "";
}

std::string home_dir() {
#ifdef _WIN32
    return get_env("USERPROFILE");
#else
    return get_env("HOME");
#endif
}

std::string themes_dir() {
#ifdef _WIN32
    std::string appdata = get_env("APPDATA");
    if (appdata.empty()) appdata = home_dir() + "\\AppData\\Roaming";
    return appdata + "\\spicetify\\Themes";
#else
    return home_dir() + "/.config/spicetify/Themes";
#endif
}

std::string theme_path() {
#ifdef _WIN32
    return themes_dir() + "\\" + THEME_NAME;
#else
    return themes_dir() + "/" + THEME_NAME;
#endif
}

bool path_exists(const std::string& p) {
#ifdef _WIN32
    DWORD attr = GetFileAttributesA(p.c_str());
    return attr != INVALID_FILE_ATTRIBUTES;
#else
    std::ifstream f(p);
    if (f.good()) return true;
    struct stat st;
    return ::stat(p.c_str(), &st) == 0;
#endif
}

std::string which(const std::string& name) {
#ifdef _WIN32
    std::string out = run_capture("where " + name + " 2>nul");
    if (!trim(out).empty()) return trim(out);
    std::string sp = themes_dir() + "\\..\\spicetify.exe";
    if (path_exists(sp)) return sp;
    return "";
#else
    std::string out = run_capture("command -v " + name + " 2>/dev/null");
    return trim(out);
#endif
}

bool command_exists(const std::string& name) {
    return !which(name).empty();
}

bool install_spicetify() {
#ifdef _WIN32
    const char* cmd =
        "powershell -NoProfile -ExecutionPolicy Bypass -Command "
        "\"iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex\"";
    std::cout << GRAY << "  Opening a new window to install Spicetify. Waiting for it to finish..." << RESET << "\n";
    run_cmd(cmd);
    std::cout << GRAY << "  Spicetify installer window closed." << RESET << "\n";
    return command_exists("spicetify");
#else
    std::cout << GRAY << "  Installing Spicetify..." << RESET << "\n";
    run_cmd("curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh");
    std::cout << GRAY << "  Spicetify installer finished." << RESET << "\n";
    return command_exists("spicetify");
#endif
}

void refresh_path() {
#ifdef _WIN32
    std::string machine = get_env("PATH");
    HKEY key;
    char buf[32768];
    DWORD sz = sizeof(buf);
    if (RegOpenKeyExA(HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
                      0, KEY_READ, &key) == ERROR_SUCCESS) {
        if (RegQueryValueExA(key, "Path", nullptr, nullptr, (LPBYTE)buf, &sz) == ERROR_SUCCESS)
            machine = buf;
        RegCloseKey(key);
    }
    std::string user;
    sz = sizeof(buf);
    if (RegOpenKeyExA(HKEY_CURRENT_USER, "Environment", 0, KEY_READ, &key) == ERROR_SUCCESS) {
        if (RegQueryValueExA(key, "Path", nullptr, nullptr, (LPBYTE)buf, &sz) == ERROR_SUCCESS)
            user = buf;
        RegCloseKey(key);
    }
    std::string combined = machine;
    if (!user.empty()) combined += ";" + user;
    _putenv(("PATH=" + combined).c_str());
#endif
}

bool test_dependencies() {
    if (command_exists("spicetify")) return true;

    std::cout << RED << "  Missing dependencies: spicetify" << RESET << "\n\n";

    if (!read_confirm("Press I to install them now, or any other key to cancel", "I"))
        return false;

    std::cout << "\n";
    std::cout << ORANGE_MID << "  Installing spicetify..." << RESET << "\n";
    install_spicetify();

    std::cout << "\n";
    std::cout << ORANGE_MID << "  Refreshing environment PATH..." << RESET << "\n";
    refresh_path();

    if (!command_exists("spicetify")) {
        std::cout << "\n";
        std::cout << RED << "  Still missing: spicetify. You may need to restart your terminal." << RESET << "\n";
        return false;
    }

    std::cout << "\n";
    std::cout << GREEN << "  All dependencies installed successfully." << RESET << "\n";
    return true;
}

void pause_return() {
    std::cout << "\n";
    std::cout << GRAY << "  Press any key to return to the menu..." << RESET << "\n";
    std::cout.flush();
    wait_key();
}

int arrow_selection(const std::vector<std::string>& items, int current_index,
                    const std::vector<std::string>& title_lines) {
    int selected = current_index >= 0 ? current_index : 0;

    auto header = header_lines();
    int overhead = static_cast<int>(header.size()) + static_cast<int>(title_lines.size()) + 4;
    int page_size = console_height() - overhead;
    if (page_size > static_cast<int>(items.size())) page_size = static_cast<int>(items.size());
    if (page_size < 1) page_size = 1;

    clear_screen();
#ifdef _WIN32
    if (g_vt_enabled) {
        HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
        CONSOLE_CURSOR_INFO ci;
        GetConsoleCursorInfo(h, &ci);
        ci.bVisible = FALSE;
        SetConsoleCursorInfo(h, &ci);
    }
#else
    std::cout << "\x1b[?25l";
#endif

    while (true) {
        int total_pages = (static_cast<int>(items.size()) + page_size - 1) / page_size;
        if (total_pages < 1) total_pages = 1;
        int current_page = selected / page_size;
        int page_start = current_page * page_size;
        int page_end = std::min(page_start + page_size - 1,
                                static_cast<int>(items.size()) - 1);

        std::vector<std::string> frame = header;
        frame.insert(frame.end(), title_lines.begin(), title_lines.end());

        for (int i = page_start; i <= page_end; i++) {
            std::string prefix = (i == current_index) ? "> " : "  ";
            std::string text = prefix + items[i];
            if (i == selected) {
                frame.push_back(SELECT_BG + text + RESET);
            } else if (i == current_index) {
                frame.push_back(GREEN_ANSI + text + RESET);
            } else {
                frame.push_back(text);
            }
        }

        int lines_used = page_end - page_start + 1;
        for (int p = lines_used; p < page_size; p++) frame.emplace_back("");

        frame.emplace_back("");
        frame.push_back(ORANGE_DARK +
                        "  =============================================================" + RESET);
        frame.push_back("  Up/Down to move, Enter to select, Esc to go back   Page " +
                        std::to_string(current_page + 1) + " of " +
                        std::to_string(total_pages));

        write_frame(frame);

        std::string key = read_key();
        if (key == "UP") {
            selected = (selected > 0) ? selected - 1 : static_cast<int>(items.size()) - 1;
        } else if (key == "DOWN") {
            selected = (selected < static_cast<int>(items.size()) - 1) ? selected + 1 : 0;
        } else if (key == "ENTER") {
#ifdef _WIN32
            if (g_vt_enabled) {
                HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
                CONSOLE_CURSOR_INFO ci;
                GetConsoleCursorInfo(h, &ci);
                ci.bVisible = TRUE;
                SetConsoleCursorInfo(h, &ci);
            }
#else
            std::cout << "\x1b[?25h";
#endif
            return selected;
        } else if (key == "ESC") {
#ifdef _WIN32
            if (g_vt_enabled) {
                HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
                CONSOLE_CURSOR_INFO ci;
                GetConsoleCursorInfo(h, &ci);
                ci.bVisible = TRUE;
                SetConsoleCursorInfo(h, &ci);
            }
#else
            std::cout << "\x1b[?25h";
#endif
            return -1;
        }
    }
}

int show_menu() {
    show_header();

    std::cout << WHITE << "  [1] Install " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [2] Update " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [3] Uninstall " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [4] Downgrade" << RESET << "\n";
    std::cout << WHITE << "  [5] Check for Updates" << RESET << "\n";
    std::cout << WHITE << "  [6] Exit" << RESET << "\n\n";
    std::cout << ORANGE_DARK
              << "  =============================================================" << RESET << "\n\n";

    std::cout << "  Select an option: ";
    std::cout.flush();
    std::string choice;
    std::getline(std::cin, choice);
    choice = trim(choice);
    if (choice.size() == 1 && choice[0] >= '1' && choice[0] <= '6')
        return choice[0] - '0';
    return 0;
}

}  // namespace

int main() {
    enable_vt();

    bool running = true;
    while (running) {
        int choice = show_menu();
        switch (choice) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            case 6: running = false; break;
            default:
                show_header();
                std::cout << RED << "  Invalid option." << RESET << "\n";
                pause_return();
                break;
        }
    }

    clear_screen();
    return 0;
}
