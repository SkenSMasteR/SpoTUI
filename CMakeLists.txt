cmake_minimum_required(VERSION 3.14)

project(spotui LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(FetchContent)

FetchContent_Declare(
    ftxui
    GIT_REPOSITORY https://github.com/ArthurSonzogni/ftxui.git
    GIT_TAG v6.1.9
    GIT_SHALLOW TRUE
    GIT_PROGRESS TRUE
)

FetchContent_MakeAvailable(ftxui)

add_executable(spotui app.cpp)

target_link_libraries(
    spotui
    PRIVATE
        ftxui::screen
        ftxui::dom
        ftxui::component
)

if(MINGW)
    target_link_options(spotui PRIVATE -static)
endif()