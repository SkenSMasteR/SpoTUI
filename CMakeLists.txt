cmake_minimum_required(VERSION 3.16)
project(spotui_installer LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

add_executable(spotui app.cpp)

set_target_properties(spotui PROPERTIES
    OUTPUT_NAME "spotui"
)

if(MSVC)
    target_compile_options(spotui PRIVATE /W4 /O2)
    target_link_libraries(spotui PRIVATE user32.lib)
else()
    target_compile_options(spotui PRIVATE -Wall -Wextra -O2)
    if(WIN32)
        set_target_properties(spotui PROPERTIES LINK_FLAGS "-static")
    endif()
endif()

if(WIN32)
    install(TARGETS spotui RUNTIME DESTINATION .)
else()
    install(TARGETS spotui RUNTIME DESTINATION bin)
endif()