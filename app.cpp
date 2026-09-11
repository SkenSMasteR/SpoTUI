#include <algorithm>
#include <cctype>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <sstream>
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
#else
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>
#endif

using namespace ftxui;
namespace fs = std::filesystem;

namespace {

const char* THEME_NAME = "SpoTUI";
const char* RELEASES_API =
    "https://api.github.com/repos/SkenSMasteR/SpoTUI/releases";
const char* VERSION_PREFIX = "spotui@";

const Color kOrangeLight = Color::RGB(255, 140, 66);
const Color kOrangeMid = Color::RGB(240, 131, 61);
const Color kOrangeDark = Color::RGB(224, 123, 57);
const Color kSelectFg = Color::RGB(0, 0, 0);
const Color kGreen = Color::RGB(140, 255, 140);
const Color kGray = Color::RGB(140, 140, 140);
const Color kRed = Color::RGB(255, 90, 90);

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
    return vbox(std::move(lines)) | hcenter;
}

std::string trim(const std::string& s) {
    std::string r = s;
    while (!r.empty() && (r.back() == '\n' || r.back() == '\r' || r.back() == ' '))
        r.pop_back();
    size_t i = 0;
    while (i < r.size() && (r[i] == ' ' || r[i] == '\n' || r[i] == '\r')) i++;
    return r.substr(i);
}

std::vector<std::string> split(const std::string& s, char delim) {
    std::vector<std::string> parts;
    std::string cur;
    std::istringstream ss(s);
    while (std::getline(ss, cur, delim)) parts.push_back(cur);
    return parts;
}

std::string quote(const std::string& s) {
    return "\"" + s + "\"";
}

#ifdef _WIN32
std::string ps_quote(const std::string& s) {
    std::string r;
    for (char c : s) {
        if (c == '\'') r += "''";
        else r += c;
    }
    return "'" + r + "'";
}
#endif

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
    return (fs::path(appdata) / "spicetify" / "Themes").string();
#else
    return (fs::path(home_dir()) / ".config" / "spicetify" / "Themes").string();
#endif
}

std::string theme_path() {
    return (fs::path(themes_dir()) / THEME_NAME).string();
}

std::string version_file() {
    return (fs::path(theme_path()) / "version.txt").string();
}

bool path_exists(const std::string& p) {
    std::error_code ec;
    return fs::exists(p, ec);
}

std::string which(const std::string& name) {
#ifdef _WIN32
    std::string out = run_capture("where " + name + " 2>nul");
    if (!trim(out).empty()) {
        auto lines = split(out, '\n');
        if (!lines.empty()) return trim(lines[0]);
    }
    std::string sp = (fs::path(themes_dir()).parent_path() / "spicetify.exe").string();
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
    run_cmd(cmd);
    return command_exists("spicetify");
#else
    run_cmd("curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh");
    return command_exists("spicetify");
#endif
}

void refresh_path() {
#ifdef _WIN32
    std::string machine = get_env("PATH");
    HKEY key;
    char buf[32768];
    DWORD sz = sizeof(buf);
    if (RegOpenKeyExA(HKEY_LOCAL_MACHINE,
                      "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
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

bool ensure_spicetify() {
    if (command_exists("spicetify")) return true;
    install_spicetify();
    refresh_path();
    return command_exists("spicetify");
}

std::string read_installed_version() {
    if (!path_exists(theme_path())) return "";
    std::ifstream in(version_file());
    if (!in) return "unknown";
    std::string line;
    std::getline(in, line);
    line = trim(line);
    return line.empty() ? "unknown" : line;
}

void write_installed_version(const std::string& version) {
    std::ofstream out(version_file());
    out << version << "\n";
}

std::string json_unescape(const std::string& s) {
    std::string out;
    for (size_t i = 0; i < s.size(); i++) {
        if (s[i] == '\\' && i + 1 < s.size()) {
            char n = s[i + 1];
            if (n == '"' || n == '\\' || n == '/') {
                out += n;
                i++;
                continue;
            }
        }
        out += s[i];
    }
    return out;
}

std::string extract_quoted(const std::string& s, size_t from, const std::string& key) {
    std::string pat = "\"" + key + "\"";
    size_t p = s.find(pat, from);
    if (p == std::string::npos) return "";
    p = s.find(':', p + pat.size());
    if (p == std::string::npos) return "";
    p = s.find('"', p + 1);
    if (p == std::string::npos) return "";
    size_t e = p + 1;
    while (e < s.size()) {
        if (s[e] == '\\' && e + 1 < s.size()) {
            e += 2;
            continue;
        }
        if (s[e] == '"') break;
        e++;
    }
    if (e >= s.size()) return "";
    return json_unescape(s.substr(p + 1, e - p - 1));
}

std::vector<int> version_parts(const std::string& name) {
    std::vector<int> parts;
    size_t at = name.find('@');
    std::string v = at == std::string::npos ? name : name.substr(at + 1);
    std::string cur;
    for (char c : v) {
        if (std::isdigit(static_cast<unsigned char>(c))) {
            cur += c;
        } else if (c == '.') {
            parts.push_back(cur.empty() ? 0 : std::atoi(cur.c_str()));
            cur.clear();
        } else {
            break;
        }
    }
    if (!cur.empty()) parts.push_back(std::atoi(cur.c_str()));
    return parts;
}

int compare_versions(const std::string& a, const std::string& b) {
    auto pa = version_parts(a);
    auto pb = version_parts(b);
    size_t n = std::max(pa.size(), pb.size());
    for (size_t i = 0; i < n; i++) {
        int av = i < pa.size() ? pa[i] : 0;
        int bv = i < pb.size() ? pb[i] : 0;
        if (av != bv) return av > bv ? 1 : -1;
    }
    return 0;
}

struct Release {
    std::string name;
    std::string zip_url;
};

std::string url_unescape(const std::string& s) {
    std::string out;
    auto hex = [](char c) -> int {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    };
    for (size_t i = 0; i < s.size(); i++) {
        if (s[i] == '%' && i + 2 < s.size()) {
            int hi = hex(s[i + 1]);
            int lo = hex(s[i + 2]);
            if (hi >= 0 && lo >= 0) {
                out += static_cast<char>((hi << 4) | lo);
                i += 2;
                continue;
            }
        }
        out += s[i];
    }
    return out;
}

std::string filename_from_url(const std::string& url) {
    std::string u = url_unescape(url);
    size_t slash = u.find_last_of('/');
    if (slash == std::string::npos) return u;
    return u.substr(slash + 1);
}

std::vector<Release> parse_releases(const std::string& json) {
    std::vector<Release> out;
    size_t pos = 0;
    const std::string key = "\"browser_download_url\"";
    while (true) {
        size_t p = json.find(key, pos);
        if (p == std::string::npos) break;
        std::string url = extract_quoted(json, p, "browser_download_url");
        pos = p + key.size();
        if (url.empty()) continue;
        std::string file = filename_from_url(url);
        if (file.rfind(VERSION_PREFIX, 0) != 0) continue;
        if (file.size() < 5 || file.substr(file.size() - 4) != ".zip") continue;
        std::string name = file.substr(0, file.size() - 4);
        bool exists = false;
        for (const auto& r : out) {
            if (r.name == name) {
                exists = true;
                break;
            }
        }
        if (exists) continue;
        out.push_back({name, url});
    }
    std::sort(out.begin(), out.end(), [](const Release& a, const Release& b) {
        return compare_versions(a.name, b.name) > 0;
    });
    return out;
}

std::string http_get(const std::string& url) {
#ifdef _WIN32
    std::string cmd =
        "curl.exe -fsSL -L -A SpoTUI -H \"Accept: application/vnd.github+json\" " +
        quote(url) + " 2>nul";
    std::string body = run_capture(cmd);
    if (!trim(body).empty()) return body;
    cmd = "powershell -NoProfile -Command "
          "\"(Invoke-WebRequest -UseBasicParsing -Uri " +
          ps_quote(url) + ").Content\"";
    return run_capture(cmd);
#else
    std::string cmd =
        "curl -fsSL -L -A SpoTUI -H 'Accept: application/vnd.github+json' " +
        quote(url) + " 2>/dev/null";
    return run_capture(cmd);
#endif
}

bool download_file(const std::string& url, const std::string& dest) {
#ifdef _WIN32
    std::string cmd =
        "curl.exe -fsSL -L -A SpoTUI -o " + quote(dest) + " " + quote(url);
    if (run_cmd(cmd) == 0 && path_exists(dest)) return true;
    cmd = "powershell -NoProfile -Command \"Invoke-WebRequest -UseBasicParsing -Uri " +
          ps_quote(url) + " -OutFile " + ps_quote(dest) + "\"";
    return run_cmd(cmd) == 0 && path_exists(dest);
#else
    std::string cmd =
        "curl -fsSL -L -A SpoTUI -o " + quote(dest) + " " + quote(url);
    return run_cmd(cmd) == 0 && path_exists(dest);
#endif
}

bool extract_zip(const std::string& zip, const std::string& dest) {
#ifdef _WIN32
    std::string cmd =
        "powershell -NoProfile -Command \"Expand-Archive -Force -LiteralPath " +
        ps_quote(zip) + " -DestinationPath " + ps_quote(dest) + "\"";
    return run_cmd(cmd) == 0;
#else
    std::string cmd =
        "python3 -c \"import zipfile; zipfile.ZipFile(r'''" + zip +
        "''').extractall(r'''" + dest + "''')\"";
    if (run_cmd(cmd) == 0) return true;
    cmd = "unzip -o " + quote(zip) + " -d " + quote(dest);
    return run_cmd(cmd) == 0;
#endif
}

bool copy_extracted(const std::string& extracted, const std::string& dest) {
    std::error_code ec;
    fs::path src(extracted);
    fs::path content = src;
    std::vector<fs::path> dirs;
    std::vector<fs::path> files;
    for (auto it = fs::directory_iterator(src, ec); !ec && it != fs::directory_iterator(); ++it) {
        if (it->is_directory()) dirs.push_back(it->path());
        else files.push_back(it->path());
    }
    if (files.empty() && dirs.size() == 1) content = dirs[0];

    fs::create_directories(dest, ec);
    if (ec) return false;

    for (auto it = fs::directory_iterator(content, ec); !ec && it != fs::directory_iterator(); ++it) {
        fs::path to = fs::path(dest) / it->path().filename();
        fs::remove_all(to, ec);
        fs::copy(it->path(), to,
                 fs::copy_options::recursive | fs::copy_options::overwrite_existing, ec);
        if (ec) return false;
    }
    return true;
}

bool apply_theme() {
    if (!ensure_spicetify()) return false;
    if (run_cmd("spicetify config current_theme " + std::string(THEME_NAME)) != 0)
        return false;
    if (run_cmd("spicetify apply -q") != 0) return false;
    return true;
}

std::vector<Release> fetch_releases() {
    std::string json = http_get(RELEASES_API);
    if (json.empty()) return {};
    return parse_releases(json);
}

std::string install_release(const Release& rel) {
    std::error_code ec;
    fs::path tmp_zip = fs::temp_directory_path() / "spotui-download.zip";
    fs::path tmp_dir = fs::temp_directory_path() / "spotui-extract";
    fs::remove_all(tmp_zip, ec);
    fs::remove_all(tmp_dir, ec);
    fs::create_directories(tmp_dir, ec);

    if (!download_file(rel.zip_url, tmp_zip.string()))
        return "Failed to download " + rel.name + ".";
    if (!extract_zip(tmp_zip.string(), tmp_dir.string())) {
        fs::remove_all(tmp_zip, ec);
        fs::remove_all(tmp_dir, ec);
        return "Failed to extract " + rel.name + ".";
    }

    fs::create_directories(themes_dir(), ec);
    if (path_exists(theme_path())) fs::remove_all(theme_path(), ec);
    fs::create_directories(theme_path(), ec);

    if (!copy_extracted(tmp_dir.string(), theme_path())) {
        fs::remove_all(tmp_zip, ec);
        fs::remove_all(tmp_dir, ec);
        return "Failed to copy theme files.";
    }

    write_installed_version(rel.name);
    fs::remove_all(tmp_zip, ec);
    fs::remove_all(tmp_dir, ec);

    if (!apply_theme())
        return rel.name + " installed, but Spicetify apply failed.";
    return rel.name + " installed and applied.";
}

std::string uninstall_theme() {
    if (!path_exists(theme_path())) return std::string(THEME_NAME) + " is not installed.";
    if (command_exists("spicetify")) {
        run_cmd("spicetify config current_theme marketplace");
        run_cmd("spicetify apply -q");
    }
    std::error_code ec;
    fs::remove_all(theme_path(), ec);
    if (ec) return "Failed to remove the theme folder.";
    return std::string(THEME_NAME) + " has been uninstalled.";
}

void launch_self_update() {
#ifdef _WIN32
    char cmd[] =
        "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "
        "\"iwr -useb https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/master/scripts/install/windows/install.ps1 | iex\"";
    STARTUPINFOA si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    ZeroMemory(&pi, sizeof(pi));
    si.cb = sizeof(si);
    CreateProcessA(nullptr, cmd, nullptr, nullptr, FALSE, CREATE_NEW_CONSOLE, nullptr,
                   nullptr, &si, &pi);
    if (pi.hThread) CloseHandle(pi.hThread);
    if (pi.hProcess) CloseHandle(pi.hProcess);
    ExitProcess(0);
#else
    execl("/bin/sh", "sh", "-c",
          "curl -fsSL -o install.sh https://raw.githubusercontent.com/SkenSMasteR/SpoTUI/master/scripts/install/linux/install.sh && chmod +x install.sh && ./install.sh",
          static_cast<char*>(nullptr));
    _exit(127);
#endif
}

MenuOption styled_menu() {
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
    return option;
}

Element frame(const Elements& body, const std::string& hint) {
    Elements rows;
    rows.push_back(logo());
    rows.push_back(separator() | color(kOrangeDark));
    rows.insert(rows.end(), body.begin(), body.end());
    rows.push_back(separator() | color(kOrangeDark));
    rows.push_back(text(hint) | color(kGray) | hcenter);
    return vbox(std::move(rows)) | border | color(kOrangeDark) | flex;
}

}  // namespace

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif

    auto screen = ScreenInteractive::Fullscreen();

    int tab = 0;
    std::vector<std::string> main_entries = {
        std::string("Install ") + THEME_NAME,
        std::string("Update ") + THEME_NAME,
        std::string("Uninstall ") + THEME_NAME,
        "Downgrade",
        "Check for Updates",
        "Self Update",
        "Exit",
    };
    int main_selected = 0;
    bool do_self_update = false;

    std::vector<Release> releases;
    std::vector<std::string> down_entries;
    int down_selected = 0;

    std::string info_text;
    Color info_color = Color::White;

    auto show_info = [&](const std::string& msg, Color c) {
        info_text = msg;
        info_color = c;
        tab = 2;
    };

    auto main_opt = styled_menu();
    main_opt.on_enter = [&] {
        if (main_selected == 5) {
            do_self_update = true;
            screen.ExitLoopClosure()();
            return;
        }

        if (main_selected == 6) {
            screen.ExitLoopClosure()();
            return;
        }

        if (main_selected == 0) {
            auto rels = fetch_releases();
            if (rels.empty()) {
                show_info("No spotui@ releases found.", kRed);
                return;
            }
            std::string msg = install_release(rels.front());
            show_info(msg, msg.find("Failed") == 0 ? kRed : kGreen);
            return;
        }

        if (main_selected == 1) {
            if (!path_exists(theme_path())) {
                show_info(std::string(THEME_NAME) + " is not installed. Use Install instead.", kRed);
                return;
            }
            auto rels = fetch_releases();
            if (rels.empty()) {
                show_info("No spotui@ releases found.", kRed);
                return;
            }
            std::string current = read_installed_version();
            if (current == rels.front().name) {
                show_info("Already on the latest version (" + current + ").", kGreen);
                return;
            }
            std::string msg = install_release(rels.front());
            show_info(msg, msg.find("Failed") == 0 ? kRed : kGreen);
            return;
        }

        if (main_selected == 2) {
            std::string msg = uninstall_theme();
            bool ok = msg.find("uninstalled") != std::string::npos;
            show_info(msg, ok ? kGreen : kRed);
            return;
        }

        if (main_selected == 3) {
            releases = fetch_releases();
            if (releases.empty()) {
                show_info("No spotui@ releases found.", kRed);
                return;
            }
            down_entries.clear();
            std::string current = read_installed_version();
            for (const auto& r : releases) {
                std::string label = r.name;
                if (r.name == current) label += "  (current)";
                if (&r == &releases.front()) label += "  (newest)";
                down_entries.push_back(label);
            }
            down_entries.push_back("Back");
            down_selected = 0;
            if (!current.empty() && current != "unknown") {
                for (size_t i = 0; i < releases.size(); i++) {
                    if (releases[i].name == current) {
                        down_selected = static_cast<int>(i);
                        break;
                    }
                }
            }
            tab = 1;
            return;
        }

        if (main_selected == 4) {
            if (!path_exists(theme_path())) {
                show_info(std::string(THEME_NAME) + " is not installed.", kRed);
                return;
            }
            auto rels = fetch_releases();
            if (rels.empty()) {
                show_info("No spotui@ releases found.", kRed);
                return;
            }
            std::string current = read_installed_version();
            if (current == rels.front().name) {
                show_info("Status: up to date (" + current + ").", kGreen);
            } else {
                show_info("Status: outdated.\nInstalled: " + current +
                              "\nNewest: " + rels.front().name,
                          kOrangeLight);
            }
        }
    };

    auto main_menu = Menu(&main_entries, &main_selected, main_opt);

    auto down_opt = styled_menu();
    down_opt.on_enter = [&] {
        if (down_entries.empty()) {
            tab = 0;
            return;
        }
        if (down_selected == static_cast<int>(down_entries.size()) - 1) {
            tab = 0;
            return;
        }
        if (down_selected < 0 || down_selected >= static_cast<int>(releases.size()))
            return;
        std::string msg = install_release(releases[down_selected]);
        show_info(msg, msg.find("Failed") == 0 ? kRed : kGreen);
    };
    auto down_menu = Menu(&down_entries, &down_selected, down_opt);

    auto main_view = Renderer(main_menu, [&] {
        std::string current = read_installed_version();
        Element status;
        if (current.empty()) {
            status = text("Status: Not Installed") | color(kRed);
        } else {
            status = text("Status: Installed (" + current + ")") | color(kGreen);
        }
        return frame(
            {
                status | hcenter,
                text("") ,
                main_menu->Render() | flex,
            },
            "Up/Down to move, Enter to select, Esc to exit");
    });

    auto down_view = Renderer(down_menu, [&] {
        return frame(
            {
                text("Select a version") | color(kOrangeMid) | hcenter,
                text(""),
                down_menu->Render() | flex,
            },
            "Enter to install, Esc to go back");
    });

    auto info_view = Renderer([&] {
        Elements lines;
        for (const auto& line : split(info_text, '\n')) {
            lines.push_back(text(line) | color(info_color) | hcenter);
        }
        return frame(
            {
                text(""),
                vbox(std::move(lines)) | flex,
            },
            "Press Enter or Esc to return");
    });

    auto tabs = Container::Tab({main_view, down_view, info_view}, &tab);

    auto component = CatchEvent(tabs, [&](Event event) {
        if (event == Event::Escape) {
            if (tab == 0) {
                screen.ExitLoopClosure()();
            } else {
                tab = 0;
            }
            return true;
        }
        if (tab == 2 && event == Event::Return) {
            tab = 0;
            return true;
        }
        return false;
    });

    screen.Loop(component);
    if (do_self_update) launch_self_update();
    return 0;
}
