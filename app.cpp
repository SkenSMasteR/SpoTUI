// Linux - g++ -std=c++17 -O2 -o spotui app.cpp

// Windows - x86_64-w64-mingw32-g++ -std=c++17 -O2 -static -o spotui.exe app.cpp

// CMake - cmake -B build && cmake --build build


#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
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
const char* REPO_URL = "https://github.com/SkenSMasteR/SpoTUI";
const char* MASTER_BRANCH = "master";

const char* BLOCK_FULL = "\u2588";
const char* BLOCK_LOWER = "\u2584";
const char* BLOCK_UPPER = "\u2580";
const char* BLOCK_LEFT = "\u258c";

// ANSI

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
        if (SetConsoleMode(h, mode | 0x0004)) {  // ENABLE_VIRTUAL_TERMINAL_PROCESSING
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

// strings

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

std::vector<std::string> split_n(const std::string& s, char delim, size_t limit) {
    std::vector<std::string> parts;
    std::string cur;
    std::istringstream ss(s);
    while (parts.size() + 1 < limit && std::getline(ss, cur, delim))
        parts.push_back(cur);
    std::string rest;
    if (std::getline(ss, rest)) parts.push_back(rest);
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

// platform

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

// process

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

// paths

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

// dependencies

std::string which(const std::string& name) {
#ifdef _WIN32
    std::string out = run_capture("where " + name + " 2>nul");
    if (!trim(out).empty()) return trim(out);
    std::vector<std::string> candidates = {
        "C:\\Program Files\\Git\\cmd\\git.exe",
        "C:\\Program Files (x86)\\Git\\cmd\\git.exe",
        home_dir() + "\\AppData\\Local\\Programs\\Git\\cmd\\git.exe",
        get_env("ProgramFiles") + "\\Git\\cmd\\git.exe",
    };
    for (const auto& c : candidates) {
        if (path_exists(c)) return c;
    }
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

std::string detect_pkg_manager() {
#ifdef _WIN32
    return command_exists("winget") ? "winget" : "";
#else
    for (const char* m : {"apt-get", "dnf", "pacman", "zypper", "apk"}) {
        if (command_exists(m)) return m;
    }
    return "";
#endif
}

[[maybe_unused]] bool refresh_pkg_manager() {
    std::string mgr = detect_pkg_manager();
    std::cout << ORANGE_MID << "  Refreshing package lists..." << RESET << "\n";
    if (mgr.empty()) return false;
#ifdef _WIN32
    return true;
#else
    if (mgr == "apt-get") return run_cmd("sudo apt-get update -y") == 0;
    if (mgr == "dnf") { run_cmd("sudo dnf check-update -y"); return true; }
    if (mgr == "pacman") return run_cmd("sudo pacman -Sy --noconfirm") == 0;
    if (mgr == "zypper") return run_cmd("sudo zypper refresh") == 0;
    if (mgr == "apk") return run_cmd("sudo apk update") == 0;
    return false;
#endif
}

bool g_pkg_refresh_attempted = false;

bool install_git() {
#ifdef _WIN32
    std::cout << GRAY << "  Launching winget to install Git..." << RESET << "\n";
    std::string base =
        "winget install --id Git.Git -e --source winget "
        "--accept-package-agreements --accept-source-agreements";
    int rc = run_cmd(base);
    std::cout << "  winget exited with code " << rc << "\n";
    if (rc == -1073741819 && !g_pkg_refresh_attempted) {
        g_pkg_refresh_attempted = true;
        std::cout << RED << "  winget crashed. Attempting to update winget and retry..." << RESET << "\n";
        if (command_exists("winget")) {
            run_cmd("winget upgrade --id Microsoft.AppInstaller -e --source winget "
                    "--accept-package-agreements --accept-source-agreements");
            run_cmd("winget source reset --force");
        }
        std::cout << GRAY << "  Retrying Git install..." << RESET << "\n";
        rc = run_cmd(base);
        std::cout << "  winget exited with code " << rc << "\n";
    }
    for (int i = 0; i < 10 && !command_exists("git"); i++) {
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
    return command_exists("git");
#else
    std::string mgr = detect_pkg_manager();
    if (mgr.empty()) {
        std::cout << RED
                  << "  No supported package manager was found. Install git manually."
                  << RESET << "\n";
        return false;
    }
    std::cout << GRAY << "  Installing git via " << mgr << "..." << RESET << "\n";
    std::string install_cmd;
    if (mgr == "apt-get") install_cmd = "sudo apt-get install -y git";
    else if (mgr == "dnf") install_cmd = "sudo dnf install -y git";
    else if (mgr == "pacman") install_cmd = "sudo pacman -S --noconfirm git";
    else if (mgr == "zypper") install_cmd = "sudo zypper install -y git";
    else if (mgr == "apk") install_cmd = "sudo apk add git";

    int rc = run_cmd(install_cmd);
    std::cout << "  package manager exited with code " << rc << "\n";

    if (rc != 0 && !g_pkg_refresh_attempted) {
        g_pkg_refresh_attempted = true;
        std::cout << RED << "  Install failed. Refreshing package lists and retrying..." << RESET << "\n";
        refresh_pkg_manager();
        std::cout << GRAY << "  Retrying git install..." << RESET << "\n";
        rc = run_cmd(install_cmd);
    }
    return command_exists("git");
#endif
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
    std::vector<std::string> missing;
    if (!command_exists("git")) missing.push_back("git");
    if (!command_exists("spicetify")) missing.push_back("spicetify");

    if (missing.empty()) return true;

    std::cout << RED << "  Missing dependencies: ";
    for (size_t i = 0; i < missing.size(); i++) {
        if (i) std::cout << ", ";
        std::cout << missing[i];
    }
    std::cout << RESET << "\n\n";

    if (!read_confirm("Press I to install them now, or any other key to cancel", "I"))
        return false;

    for (const auto& dep : missing) {
        std::cout << "\n";
        std::cout << ORANGE_MID << "  Installing " << dep << "..." << RESET << "\n";
        if (dep == "git") install_git();
        else if (dep == "spicetify") install_spicetify();
    }

    std::cout << "\n";
    std::cout << ORANGE_MID << "  Refreshing environment PATH..." << RESET << "\n";
    refresh_path();

    std::vector<std::string> still_missing;
    if (!command_exists("git")) still_missing.push_back("git");
    if (!command_exists("spicetify")) still_missing.push_back("spicetify");

    if (!still_missing.empty()) {
        std::cout << "\n";
        std::cout << RED << "  Still missing: ";
        for (size_t i = 0; i < still_missing.size(); i++) {
            if (i) std::cout << ", ";
            std::cout << still_missing[i];
        }
        std::cout << ". You may need to restart your terminal." << RESET << "\n";
        return false;
    }

    std::cout << "\n";
    std::cout << GREEN << "  All dependencies installed successfully." << RESET << "\n";
    return true;
}

// git

std::string git_dir_flag() {
    return " -C \"" + theme_path() + "\"";
}

std::string git_cmd(const std::string& args) {
    return "git" + git_dir_flag() + " " + args;
}

std::string get_default_branch() {
    std::string ref = trim(run_capture(git_cmd("symbolic-ref refs/remotes/origin/HEAD")));
    if (!ref.empty()) {
        auto parts = split(ref, '/');
        if (!parts.empty()) return parts.back();
    }
    return "main";
}

bool is_detached() {
    std::string out = run_capture(git_cmd("symbolic-ref -q HEAD"));
    return trim(out).empty();
}

struct ThemeStatus {
    std::string text;
    std::string color;
};

ThemeStatus theme_status_detailed() {
    ThemeStatus s;
    if (!path_exists(theme_path())) {
        s.text = "Not Installed";
        s.color = RED;
        return s;
    }
    if (!command_exists("git")) {
        s.text = "Installed";
        s.color = GREEN;
        return s;
    }

    run_cmd(git_cmd("fetch origin"));
    std::string local_hash = trim(run_capture(git_cmd("rev-parse HEAD")));

    if (is_detached()) {
        std::string short_hash = local_hash.empty() ? "unknown" : local_hash.substr(0, 7);
        s.text = "Installed (custom commit " + short_hash + ")";
        s.color = CYAN;
        return s;
    }

    std::string branch = get_default_branch();
    std::string remote_hash = trim(run_capture(git_cmd("rev-parse origin/" + branch)));

    if (local_hash.empty() || remote_hash.empty()) {
        s.text = "Installed";
        s.color = GREEN;
        return s;
    }

    if (local_hash == remote_hash) {
        s.text = "Installed (up to date)";
        s.color = GREEN;
    } else {
        s.text = "Installed (outdated)";
        s.color = RED;
    }
    return s;
}

struct Commit {
    std::string full;
    std::string short_hash;
    std::string date;
    std::string subject;
};

std::vector<Commit> get_commit_list_for_ref(const std::string& ref) {
    std::vector<Commit> commits;
    run_cmd(git_cmd("fetch origin"));
    std::string raw = run_capture(
        git_cmd("log " + ref + " \"--pretty=format:%H|%h|%ad|%s\" --date=short"));
    for (const auto& line : split(raw, '\n')) {
        if (trim(line).empty()) continue;
        auto p = split_n(line, '|', 4);
        if (p.size() < 4) continue;
        commits.push_back({p[0], p[1], p[2], p[3]});
    }
    return commits;
}

std::vector<std::string> get_branch_list() {
    std::vector<std::string> branches;
    run_cmd(git_cmd("fetch origin"));
    std::string raw = run_capture(git_cmd("branch -r --format=\"%(refname:short)\""));
    for (const auto& line : split(raw, '\n')) {
        std::string b = trim(line);
        if (b.empty()) continue;
        if (b.find("origin/HEAD") != std::string::npos) continue;
        auto slash = b.find('/');
        if (slash == std::string::npos) continue;
        branches.push_back(b.substr(slash + 1));
    }
    return branches;
}

// menu/UI

void pause_return() {
    std::cout << "\n";
    std::cout << GRAY << "  Press any key to return to the menu..." << RESET << "\n";
    std::cout.flush();
    wait_key();
}

// list returns selected index or -1 on ESC
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

// theme actions

void install_theme() {
    show_header();
    std::cout << ORANGE_LIGHT << "  Installing " << THEME_NAME << "..." << RESET << "\n\n";

    if (!test_dependencies()) {
        pause_return();
        return;
    }

#ifdef _WIN32
    std::string mkdir_cmd = "if not exist \"" + themes_dir() + "\" mkdir \"" + themes_dir() + "\"";
#else
    std::string mkdir_cmd = "mkdir -p \"" + themes_dir() + "\"";
#endif
    run_cmd(mkdir_cmd);

    if (path_exists(theme_path())) {
        std::cout << ORANGE_MID << "  Theme already exists locally. Pulling latest changes..." << RESET << "\n";
        run_cmd(git_cmd("pull origin " + std::string(MASTER_BRANCH)));
    } else {
        std::string cmd = "git clone -b " + std::string(MASTER_BRANCH) + " \"" +
                          std::string(REPO_URL) + "\" \"" + theme_path() + "\"";
        run_cmd(cmd);
    }

    if (path_exists(theme_path())) {
        std::cout << "\n";
        std::cout << ORANGE_MID << "  Setting current theme to " << THEME_NAME << "..." << RESET << "\n";
        run_cmd("spicetify config current_theme " + std::string(THEME_NAME));

        std::cout << ORANGE_MID << "  Applying Spicetify..." << RESET << "\n";
        run_cmd("spicetify apply -q");

        std::cout << "\n";
        std::cout << GREEN << "  " << THEME_NAME
                  << " installed and applied successfully." << RESET << "\n";
    } else {
        std::cout << "\n";
        std::cout << RED << "  Installation failed. Check the errors above." << RESET << "\n";
    }

    pause_return();
}

void update_theme() {
    show_header();
    std::cout << ORANGE_LIGHT << "  Updating " << THEME_NAME << "..." << RESET << "\n\n";

    if (!path_exists(theme_path())) {
        std::cout << RED << "  " << THEME_NAME << " is not installed. Use Install instead." << RESET << "\n";
        pause_return();
        return;
    }

    if (!test_dependencies()) {
        pause_return();
        return;
    }

    run_cmd(git_cmd("fetch origin"));

    std::cout << ORANGE_MID << "  Switching to " << MASTER_BRANCH << " branch..." << RESET << "\n";
    run_cmd(git_cmd(std::string("-c advice.detachedHead=false checkout -q ") + MASTER_BRANCH));
    run_cmd(git_cmd(std::string("pull origin ") + MASTER_BRANCH));

    std::cout << "\n";
    std::cout << ORANGE_MID << "  Re-applying Spicetify..." << RESET << "\n";
    run_cmd("spicetify apply -q");

    std::cout << "\n";
    std::cout << GREEN << "  " << THEME_NAME << " updated successfully." << RESET << "\n";
    pause_return();
}

void uninstall_theme() {
    show_header();
    std::cout << ORANGE_LIGHT << "  Uninstalling " << THEME_NAME << "..." << RESET << "\n\n";

    if (!path_exists(theme_path())) {
        std::cout << RED << "  " << THEME_NAME << " is not installed." << RESET << "\n";
        pause_return();
        return;
    }

    std::cout << GRAY << "  This will remove the theme folder and switch to Marketplace." << RESET << "\n";
    if (!read_confirm("Type Y to confirm", "Y")) {
        std::cout << GRAY << "  Cancelled." << RESET << "\n";
        pause_return();
        return;
    }

    if (command_exists("spicetify")) {
        std::cout << ORANGE_MID << "  Switching Spicetify theme..." << RESET << "\n";
        run_cmd("spicetify config current_theme \"SpoTUI-\"");
        run_cmd("spicetify config current_theme marketplace");
        run_cmd("spicetify apply -q");
    }

#ifdef _WIN32
    std::string rm = "rmdir /s /q \"" + theme_path() + "\"";
#else
    std::string rm = "rm -rf \"" + theme_path() + "\"";
#endif
    run_cmd(rm);

    std::cout << "\n";
    std::cout << GREEN << "  " << THEME_NAME << " has been uninstalled." << RESET << "\n";
    pause_return();
}

void checkout_commit(const Commit& c) {
    show_header();
    std::cout << ORANGE_LIGHT << "  Checking out commit " << c.short_hash << "..." << RESET << "\n";
    std::cout << GRAY << "  " << c.date << "  " << c.subject << RESET << "\n\n";
    std::cout << GRAY << "  This will switch the theme to this specific version." << RESET << "\n";
    if (!read_confirm("Type Y to confirm", "Y")) {
        std::cout << GRAY << "  Cancelled." << RESET << "\n";
        pause_return();
        return;
    }

    run_cmd(git_cmd("-c advice.detachedHead=false checkout -q " + c.full));

    if (command_exists("spicetify")) {
        std::cout << "\n";
        std::cout << ORANGE_MID << "  Applying Spicetify..." << RESET << "\n";
        run_cmd("spicetify apply -q");
    }

    std::cout << "\n";
    std::cout << GREEN << "  " << THEME_NAME << " is now on commit "
              << c.short_hash << "." << RESET << "\n";
    pause_return();
}

void show_commit_history() {
    if (!path_exists(theme_path())) {
        show_header();
        std::cout << RED << "  " << THEME_NAME << " is not installed." << RESET << "\n";
        pause_return();
        return;
    }

    if (!test_dependencies()) {
        pause_return();
        return;
    }

    bool viewing = true;
    while (viewing) {
        auto commits = get_commit_list_for_ref("origin/" + std::string(MASTER_BRANCH));
        if (commits.empty()) {
            show_header();
            std::cout << RED << "  No commits found." << RESET << "\n";
            pause_return();
            return;
        }

        std::string current_hash = trim(run_capture(git_cmd("rev-parse HEAD")));

        int current_index = -1;
        std::vector<std::string> items;
        for (size_t i = 0; i < commits.size(); i++) {
            items.push_back(commits[i].short_hash + "  " + commits[i].date + "  " +
                            commits[i].subject);
            if (commits[i].full == current_hash) current_index = static_cast<int>(i);
        }
        size_t return_latest_index = items.size();
        items.push_back("Return to latest version");
        size_t back_index = items.size();
        items.push_back("Back");

        std::vector<std::string> title_lines = {
            ORANGE_LIGHT + "  Commit History (" + MASTER_BRANCH + ")" + RESET, ""};

        int selection = arrow_selection(items, current_index, title_lines);

        if (selection == -1 || static_cast<size_t>(selection) == back_index) {
            viewing = false;
        } else if (static_cast<size_t>(selection) == return_latest_index) {
            update_theme();
        } else if (selection >= 0 && static_cast<size_t>(selection) < commits.size()) {
            checkout_commit(commits[selection]);
        }
    }
}

void show_branch_commits(const std::string& branch) {
    bool viewing = true;
    while (viewing) {
        auto commits = get_commit_list_for_ref("origin/" + branch);
        if (commits.empty()) {
            show_header();
            std::cout << RED << "  No commits found on " << branch << "." << RESET << "\n";
            pause_return();
            return;
        }

        std::string current_hash = trim(run_capture(git_cmd("rev-parse HEAD")));

        int current_index = -1;
        std::vector<std::string> items;
        for (size_t i = 0; i < commits.size(); i++) {
            items.push_back(commits[i].short_hash + "  " + commits[i].date + "  " +
                            commits[i].subject);
            if (commits[i].full == current_hash) current_index = static_cast<int>(i);
        }
        size_t back_index = items.size();
        items.push_back("Back");

        std::vector<std::string> title_lines = {ORANGE_LIGHT + "  " + branch + " Commits" + RESET, ""};

        int selection = arrow_selection(items, current_index, title_lines);

        if (selection == -1 || static_cast<size_t>(selection) == back_index) {
            viewing = false;
        } else if (selection >= 0 && static_cast<size_t>(selection) < commits.size()) {
            checkout_commit(commits[selection]);
        }
    }
}

void show_branches() {
    if (!path_exists(theme_path())) {
        show_header();
        std::cout << RED << "  " << THEME_NAME << " is not installed." << RESET << "\n";
        pause_return();
        return;
    }

    if (!test_dependencies()) {
        pause_return();
        return;
    }

    bool viewing = true;
    while (viewing) {
        auto branches = get_branch_list();
        if (branches.empty()) {
            show_header();
            std::cout << RED << "  No branches found." << RESET << "\n";
            pause_return();
            return;
        }

        std::vector<std::string> items = branches;
        size_t back_index = items.size();
        items.push_back("Back");

        std::vector<std::string> title_lines = {ORANGE_LIGHT + "  Branches" + RESET, ""};

        int selection = arrow_selection(items, -1, title_lines);

        if (selection == -1 || static_cast<size_t>(selection) == back_index) {
            viewing = false;
        } else if (selection >= 0 && static_cast<size_t>(selection) < branches.size()) {
            show_branch_commits(branches[selection]);
        }
    }
}

void check_for_updates() {
    show_header();
    std::cout << ORANGE_LIGHT << "  Checking for updates..." << RESET << "\n\n";

    if (!path_exists(theme_path())) {
        std::cout << RED << "  " << THEME_NAME << " is not installed." << RESET << "\n";
        pause_return();
        return;
    }

    if (!test_dependencies()) {
        pause_return();
        return;
    }

    ThemeStatus status = theme_status_detailed();
    std::cout << WHITE << "  Status: " << status.color << status.text << RESET << "\n";

    if (status.text == "Installed (outdated)") {
        std::cout << "\n";
        std::cout << GRAY << "  A newer version is available." << RESET << "\n";
        if (read_confirm("Type Y to update now", "Y")) {
            update_theme();
            return;
        }
    }

    pause_return();
}

// menu

int show_menu() {
    show_header();
    ThemeStatus status = theme_status_detailed();

    std::cout << WHITE << "  Status: " << status.color << status.text << RESET << "\n\n";
    std::cout << WHITE << "  [1] Install " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [2] Update " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [3] Uninstall " << THEME_NAME << RESET << "\n";
    std::cout << WHITE << "  [4] Commit History / Downgrade" << RESET << "\n";
    std::cout << WHITE << "  [5] Branches (switch to a different branch)" << RESET << "\n";
    std::cout << WHITE << "  [6] Check for Updates" << RESET << "\n";
    std::cout << WHITE << "  [7] Exit" << RESET << "\n\n";
    std::cout << ORANGE_DARK
              << "  =============================================================" << RESET << "\n\n";

    std::cout << "  Select an option: ";
    std::cout.flush();
    std::string choice;
    std::getline(std::cin, choice);
    choice = trim(choice);
    if (choice.size() == 1 && choice[0] >= '1' && choice[0] <= '7')
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
            case 1: install_theme(); break;
            case 2: update_theme(); break;
            case 3: uninstall_theme(); break;
            case 4: show_commit_history(); break;
            case 5: show_branches(); break;
            case 6: check_for_updates(); break;
            case 7: running = false; break;
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